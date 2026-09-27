#!/usr/bin/env node
/*
 * Renders index.html to an MP4 by stepping seek(t) frame by frame in headless
 * Chromium and piping screenshots into ffmpeg.
 *
 *   node render.cjs                         # 1080p60, 2× temporal supersampling
 *   node render.cjs --fps 30 --sub 1 --out preview.mp4
 *   node render.cjs --stills 0.8,3.2,6.1    # PNG stills for review
 *
 * Needs `playwright-core` and an ffmpeg binary with libx264 (FFMPEG env var or
 * `ffmpeg` on PATH). CHROMIUM overrides the browser executable.
 */
const http = require('http')
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { chromium } = require('playwright-core')

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]?.startsWith('--') ? true : all[i + 1] ?? true]] : acc), []),
)
const FPS = Number(args.fps ?? 60)
const SUB = Number(args.sub ?? 2) // sub-frames blended per output frame (motion blur)
const OUT = path.resolve(args.out ?? path.join(__dirname, 'opuspass-launch-15s.mp4'))
const FROM = Number(args.from ?? 0)
const FFMPEG = process.env.FFMPEG || 'ffmpeg'
const ROOT = path.resolve(__dirname, '../..') // apps/opus_pass — serves /public assets too

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.cjs': 'text/javascript', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2' }
function serve() {
  const server = http.createServer((req, res) => {
    const file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname))
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end() }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' })
    fs.createReadStream(file).pipe(res)
  })
  return new Promise((r) => server.listen(0, '127.0.0.1', () => r(server)))
}

;(async () => {
  const server = await serve()
  const url = `http://127.0.0.1:${server.address().port}/marketing/launch-video/index.html`
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM || undefined,
    args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--disable-lcd-text'],
  })
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })
  await page.goto(url)
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 })
  const duration = await page.evaluate(() => window.DURATION)

  if (args.stills) {
    for (const t of String(args.stills).split(',').map(Number)) {
      await page.evaluate((t) => window.seek(t), t)
      const file = path.join(path.dirname(OUT), `still-${t.toFixed(2)}.png`)
      await page.screenshot({ path: file })
      console.log('still', file)
    }
    await browser.close(); server.close(); return
  }

  const to = Number(args.to ?? duration)
  const total = Math.round((to - FROM) * FPS)
  const rate = FPS * SUB
  // tmix averages each group of SUB sub-frames (a ~180° shutter); select keeps
  // the last frame of every group so groups never straddle two output frames.
  const vf = SUB > 1 ? `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/${FPS}/TB,` : ''
  const ff = spawn(FFMPEG, [
    '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(rate), '-i', '-',
    '-vf', `${vf}format=yuv420p`, '-r', String(FPS),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(args.crf ?? 16), '-profile:v', 'high',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
    '-movflags', '+faststart', '-t', String(to - FROM), OUT,
  ], { stdio: ['pipe', 'inherit', 'inherit'] })

  const t0 = Date.now()
  for (let f = 0; f < total * SUB; f++) {
    // sub-frames spread across half of each output frame (180° shutter)
    const t = FROM + (Math.floor(f / SUB) + 0.5 * (f % SUB) / SUB) / FPS
    await page.evaluate((t) => window.seek(Math.max(0, t)), Math.min(t, duration - 1e-4))
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 })
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r))
    if (f % 60 === 0) process.stdout.write(`\rframe ${f}/${total * SUB}  ${((Date.now() - t0) / 1000).toFixed(0)}s`)
  }
  ff.stdin.end()
  await new Promise((r) => ff.on('close', r))
  console.log(`\nwrote ${OUT}`)
  await browser.close(); server.close()
})()

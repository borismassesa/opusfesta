// Builds public/entrance-pass/ticket-template.png from the designer's SVG.
//
// The SVG (src/assets/svg/opuspass_entrance_tickets.svg) carries sample data
// ("Claudia & Daniel", a sample QR, a SINGLE pill...). The entrance-pass route
// draws each guest's real data at render time, so this script strips every
// sample-data group and rasterizes only the static artwork (background,
// ornaments, logo, "The wedding of", perforation line). All remaining art is
// outlined paths, so no fonts are needed to rasterize.
//
// Run from apps/opus_pass:  node scripts/build-entrance-pass-template.mjs
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const sharp = require('sharp')

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(appDir, 'src/assets/svg/opuspass_entrance_tickets.svg')
const OUT = path.join(appDir, 'public/entrance-pass/ticket-template.png')

// Must stay in sync with the coordinate constants in
// src/app/entrance-pass/[token]/route.tsx (both derive from the SVG's
// 3251.85 x 4704.4 viewBox at this width).
const OUT_WIDTH = 1300

// Sample-data groups to strip; the route redraws each one with real data.
const DYNAMIC_GROUPS = ['Couple_Names', 'Date', 'Venue', 'QR_CODE', 'Ticket_Type_bg', 'Ticket_Type_Text']

/** Remove a top-level `<g id="...">...</g>` block, balancing nested <g>. */
function stripGroup(svg, id) {
  const marker = svg.indexOf(`id="${id}"`)
  if (marker === -1) throw new Error(`group ${id} not found`)
  const start = svg.lastIndexOf('<g', marker)
  const re = /<g\b|<\/g>/g
  re.lastIndex = start
  let depth = 0
  for (let m; (m = re.exec(svg)); ) {
    depth += m[0] === '<g' ? 1 : -1
    if (depth === 0) return svg.slice(0, start) + svg.slice(re.lastIndex)
  }
  throw new Error(`unbalanced <g> while stripping ${id}`)
}

let svg = await readFile(SRC, 'utf8')
for (const id of DYNAMIC_GROUPS) svg = stripGroup(svg, id)
// The embedded @font-face fonts only serve the live-text sample groups just
// removed — drop the whole <defs> (its lone child is that <style>).
svg = svg.replace(/<defs>[\s\S]*?<\/defs>/, '')

const info = await sharp(Buffer.from(svg), { density: 72 })
  .resize({ width: OUT_WIDTH })
  .png({ compressionLevel: 9 })
  .toFile(OUT)
console.log(`wrote ${path.relative(appDir, OUT)} ${info.width}x${info.height} (${info.size} bytes)`)

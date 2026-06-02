// Resolve a local public asset path against the app's basePath.
//
// opus_pass runs under basePath '/opuspass', so files in public/ are served at
// `/opuspass/...`. next/image goes through image-loader.ts, but RAW references
// (plain <img>, CSS background-image, <link rel="preload">, SVG <image>, etc.) and
// CMS-stored asset paths are NOT rewritten by Next — they'd request `/assets/...`
// at the root, which 404s both standalone and (especially) through the opus_website
// proxy. Wrap such raw references with assetPath() so they resolve under /opuspass.
//
// Absolute URLs (http/https), data: and blob: URIs pass through unchanged.

const BASE_PATH = '/opuspass'

export function assetPath(src: string | null | undefined): string {
  if (!src) return ''
  if (/^https?:\/\//.test(src) || src.startsWith('data:') || src.startsWith('blob:')) {
    return src
  }
  return src.startsWith(BASE_PATH) ? src : `${BASE_PATH}${src}`
}

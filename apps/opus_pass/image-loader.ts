// Custom next/image loader for the multi-zone basePath setup.
//
// opus_pass runs under basePath '/opuspass' (mounted at opusfesta.com/opuspass via
// opus_website rewrites, and at opuspass.opusfesta.com/opuspass standalone). Under a
// basePath, files in public/ are served at `${basePath}/...` — so a local image at
// public/assets/x.jpg is reachable at /opuspass/assets/x.jpg, NOT /assets/x.jpg.
//
// Next's DEFAULT loader builds the optimizer request as
//   /opuspass/_next/image?url=/assets/x.jpg
// i.e. it prefixes the optimizer ENDPOINT with basePath but leaves the `url` param
// un-prefixed, so the optimizer 400s trying to read /assets/x.jpg. We can't fix that
// by pointing a custom loader back at /_next/image either: configuring `loaderFile`
// DISABLES the built-in optimizer endpoint (it 404s), since Next assumes an external
// optimizer.
//
// So this loader serves the original asset directly (unoptimized), prefixing the
// basePath so the path resolves through both the standalone deployment and the
// opus_website proxy. This is a deliberate tradeoff: opus_pass loses Next's on-the-fly
// image optimization. Follow-up to restore it: move assets to a remote CDN/Supabase
// Storage (optimized via images.remotePatterns), or migrate routes under an app/opuspass
// segment + assetPrefix instead of basePath.

const BASE_PATH = '/opuspass'

type LoaderArgs = { src: string; width: number; quality?: number }

export default function opusPassImageLoader({ src }: LoaderArgs): string {
  // Absolute / inline sources are served as-is.
  if (/^https?:\/\//.test(src) || src.startsWith('data:') || src.startsWith('blob:')) {
    return src
  }
  // Local public asset — prefix basePath so it resolves under /opuspass.
  return src.startsWith(BASE_PATH) ? src : `${BASE_PATH}${src}`
}

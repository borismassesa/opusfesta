// Resolve a local public asset path.
//
// opus_pass is now served at the root of its own subdomain (no basePath), so
// files in public/ are served at `/...` exactly as written and need no prefix.
// This helper is kept as a thin pass-through so the many call sites (raw <img>,
// CSS background-image, SVG <image>, CMS-stored asset paths) stay valid; it just
// normalises empty values. If a basePath/assetPrefix is ever reintroduced,
// prepend it here in one place.

export function assetPath(src: string | null | undefined): string {
  return src ?? ''
}

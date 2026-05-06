// OF-ADM-EDITORIAL-001 — shared compact-select styling for the editorial
// filter bars (Authors, Articles, Submissions). Centralized so the three
// tabs stay visually identical and changes happen in one place.
//
// Design notes:
//   - `appearance-none` strips the native chevron so we can ship a custom
//     SVG that matches across browsers and matches the input/select
//     vertical rhythm exactly.
//   - 13px font + tight padding keeps the row dense enough to fit search +
//     three filters + sort on a single line at typical admin widths
//     (~960px content area inside a 1200px container).
//   - The chevron is inlined as a data URI to avoid a runtime asset fetch.

const CHEVRON_SVG = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23687280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>`
)

export const COMPACT_SELECT_CLS = [
  'appearance-none cursor-pointer',
  'inline-flex items-center rounded-lg border border-gray-200 bg-white',
  'pl-3 pr-8 py-1.5 text-[13px] font-medium text-gray-700',
  'transition-colors hover:border-gray-300',
  'focus:outline-none focus:ring-2 focus:ring-[#C9A0DC] focus:border-transparent',
  // Custom chevron via inline SVG. bg-no-repeat + positioned right inside
  // the right padding we reserved with `pr-8`.
  `bg-[url("data:image/svg+xml;utf8,${CHEVRON_SVG}")]`,
  'bg-no-repeat bg-[length:14px_14px] bg-[right_10px_center]',
].join(' ')

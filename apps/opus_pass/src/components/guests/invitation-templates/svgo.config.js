// SVGO config for post-processing Figma-exported SVG files before JSX conversion.
// Run: npx svgo --config=svgo.config.js input.svg -o output.svg
module.exports = {
  plugins: [
    { name: 'preset-default', params: { overrides: { removeViewBox: false } } },
    { name: 'removeAttrs', params: { attrs: ['data-name'] } },
    // Preserve ids used by engineers to identify layers for JSX replacement
    { name: 'cleanupIds', params: { preserve: ['bg-rect', 'names-text', 'date-text', 'venue-text', 'accent-line'] } },
  ],
}

// Shared (client-safe) types for mockup card placement.
//
// Kept OUT of the server-only `mockup-carousel.ts` loader so the client
// MockupCarousel can import the type and default without dragging server-only
// code into the client bundle (see the "pure utils out of server-only modules"
// rule). The loader re-exports these for convenience.

export type CardPlacement = {
  x: number       // card center X, % of container width
  y: number       // card center Y, % of container height
  width: number   // card width, % of container width
  rotate: number  // rotation in degrees
  hidden: boolean // hide the overlay (mockup already contains a printed card)
}

export const DEFAULT_CARD_PLACEMENT: CardPlacement = { x: 50, y: 50, width: 62, rotate: 0, hidden: false }

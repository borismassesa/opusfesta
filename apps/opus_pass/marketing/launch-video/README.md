# OpusPass — 15s launch film

A 15-second, 1920×1080 @ 60fps product film for OpusPass. It's built as code (HTML + a frame-exact timeline) rather than screen recordings, so every UI element is re-drawn from the product's own design language and can be edited and re-rendered.

## Concept — *"Every invite counts."*

The film follows **one guest, Amani**, through **one celebration** (Claudia & Daniel, Holy Family Basilica, Arusha). It goes from the WhatsApp invite, to the entrance, to their seat, to the memories. The event platform works in the background: live RSVPs, check-in, seating, pledges, Guest Gala and reporting. It ends on the brand's own tagline.

**Visual language** (taken from `apps/opus_pass`):
- Plum `#5C2D8C`, lavender `#C6A1CB` / accent `#C9A0DC`, violet sparkle `#8350E8`, cream `#FAF6EF`, ink `#1A1A1A`, and the dashboard's success lime `#9FE870`.
- Plus Jakarta Sans (800 headlines, as on the site hero) paired with an italic Cormorant serif, which echoes the logo's didone letterforms.
- The four-point **sparkle** from the OpusPass mark is used as the motif for twinkles, the tag icon and the final flare.
- The real OpusPass logo SVG, the entrance-pass layout (`public/entrance-pass/ticket-preview.png`), the site's couple photography, and CTA styling (lavender pill, uppercase, wide tracking).
- Neutral stage: warm charcoal with drifting champagne and warm-white light, soft vignette and film grain. Brand plum appears only in the product UI and logo. The film resolves to a cream end card.

## Sequence & on-screen copy

| Time | Shot | On-screen copy |
|---|---|---|
| 0.0–1.9 | Light streak and kinetic type. The italic word swaps (site's RotatingWord idea). Text pushes into depth. | **Every** *guest.* → **Every** *moment.* |
| 1.6–4.6 | Phone rises in 3D with the digital invitation. A WhatsApp notification drops in. Tap → RSVP morphs to *Attending ✓*. Live RSVP counter climbs to 248/300. Guest list cascades in, and Amani flips Pending → Attending. | 01 · INVITATIONS · RSVP — **Invited** *in style.* |
| 4.4–7.0 | The phone flips into the purple entrance pass. The QR code (real, scannable) builds from its centre. Scan brackets snap and a beam sweeps. The pass turns green and "Karibu, Amani!" pops forward. Gate A counter goes 186 → 187 and the arrivals list pushes down. | 02 · QR PASSES · CHECK-IN — **Welcomed** *in seconds.* |
| 6.9–9.2 | The phone lays down into a 3D venue floor plan. Guests stream from the entrance as light trails and fill their seats. The Table 7 billboard counts to 10/10. | 03 · GUESTS · SEATING — **Every seat,** *in its place.* |
| 8.9–11.0 | The Guest Gala wall (photo and video) scrolls in parallax. Upload toasts appear. The *Pledges · Ahadi* card counts TZS 9.8M → 12.45M, and a new pledge arrives with a +TZS 500,000 chip. | 04 · PLEDGES · GUEST GALA — **Celebrated** *together.* |
| 10.9–12.7 | Event report dashboard: KPIs count up, the attendance donut draws, arrivals bars grow, Gala tiles appear. It then collapses into the sparkle. | 05 · EVENT REPORTING — **Every detail,** *in view.* |
| 12.3–15.0 | The sparkle flares and a cream iris opens. The OpusPass logo assembles (sparkles spin in, letters rise, tagline settles). The feature line and CTA follow. The end card holds so it can be read. | **OpusPass — Every Invite Counts** · Invitations · RSVP · QR passes · Check-in · Seating · Pledges · Guest Gala · Reports · **START FREE → opuspass.opusfesta.com** |

A feature rail at the bottom lights up each capability as it appears, so all nine features are named on screen.

## Render

```bash
npm i playwright-core                     # any dir on NODE_PATH
export FFMPEG=/path/to/ffmpeg             # needs libx264
export CHROMIUM=/path/to/chrome           # optional
node render.cjs                           # → opuspass-launch-15s.mp4 (1080p60, 2× sub-frame motion blur)
node render.cjs --fps 30 --sub 1 --out preview.mp4
node render.cjs --stills 3.4,6.3,14.9     # PNG stills
```

`render.cjs` serves `apps/opus_pass`, so the film uses the real assets in `public/`. To inspect a single frame in a browser, open `index.html?t=6.3` through any static server rooted at `apps/opus_pass`; `?play` previews in real time. Fonts (OFL) are bundled in `fonts/`. `qr.js` holds the QR matrix, which encodes an OpusPass pass URL.

The film is silent by design so it can be scored or used on social with captions. Sound hits line up with 0.1 (streak), 3.1 (tap), 6.0 (scan), 12.4 (flare) and 13.0 (logo).

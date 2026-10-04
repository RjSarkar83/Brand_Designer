# ArtViSiON vector-portfolio promo integration

This working copy adds a short, silent promotional preview of the `vector-portfolio` site to the front glass display on the Brand_Designer page.

## What it does

- Starts about 1.15 seconds after the welcome intro finishes.
- Plays five compact scenes in the front display, using artwork from the supplied vector portfolio.
- Loads later artwork only as needed and disables nested SVG motion to reduce page load and rendering work.
- Gently animates the ArtViSiON mark, with a warmer reveal/glow on the final logo.
- On the final frame, twin red-and-gold laser beams fire from the ArtViSiON logo's eyes toward the owl button; the owl itself gets a soft glow, with no circle/ring. The existing owl button already opens `https://rjsarkar83.github.io/vector-portfolio/`.
- The owl badge is icon-only (no visible “Vector” caption) and slightly smaller; the ad can still highlight it without a ring.
- Includes a skip control and a replay button after the first play. No audio is added.

## Publish to GitHub Pages

This is a local preview/package only; it has **not** been pushed to or published on the live GitHub Pages site.

1. Back up the current `index.html` in the `Brand_Designer` repository.
2. Copy the included `index.html`, `portfolio-ad.css`, `portfolio-ad.js`, and `assets/portfolio-ad/` folder into the repository root, replacing the old `index.html`.
3. Commit and push the changes to the repository's Pages branch (currently `main`). GitHub Pages will publish after the push.

The ad artwork is stored locally in `assets/portfolio-ad/` so the embedded preview does not depend on the other site's availability at playback time.

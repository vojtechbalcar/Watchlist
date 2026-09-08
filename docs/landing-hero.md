---
type: decision
updated: 2026-09-08
status: in-review
---

# Landing hero

Related: [[neutral-page-design]], [[git-commit-workflow]], [[watchlist-placeholder-data]]

Build only the landing hero at `/landing` on `feat/landing-hero`; keep the existing dashboard at `/` while the direction is under review. The GitHub branch was created at the existing base commit before hero implementation.

## User correction

The first hero looked too much like an application screen. The landing page must attract attention and remain only loosely related to the app's design. A compact interactive chart and benchmark panel were rejected as the hero visual. Do not apply the dashboard's density and restrained layout literally to marketing pages.

Keep the supplied headline, “Both green. One losing.” Use larger typography, expressive composition, a maroon primary action, and a custom vector illustration. The stock and benchmark labels show +18.7% and +22.1%, with a −3.4 percentage-point benchmark gap. These are illustrative returns, not live data.

## Professional tone and cleanup

The user liked the direction of the illustration but requested a more grounded, professional finance feel. Tilted cards, ticket cutouts, thick shadows, dashed arrow paths, circles, plus signs, diamonds, and captions around the illustration were rejected. Use straight cards with the app's neutral surfaces, thin borders, compact typography, and consistent market colors. Retain the large sculpted forms and make brand details maroon.

Remove the eyebrow above the headline, the “No account” promise, and all decorative captions under the graphic. Calls to action need larger type relative to their padding. The landing hero needs to attract attention without returning to a literal dashboard panel.

## Account entry and future routing

The product requires an account and an initial setup wizard. Remove the landing header's direct Explore link, which bypasses that sequence. For now, both “Go to watchlist” buttons statically link to `/register`; “Sign in” links to `/login`. The registration page already offers a link to login. No landing action should send a new visitor directly into Explore, Compare, or the dashboard.

Later, replace the static destination using session/cached authentication and setup state: signed-out users go to login/registration, signed-in users with incomplete setup go to the wizard, and users with completed setup go to the watchlist. The user's reference to cache is a future routing requirement, not authentication implemented in this hero. Validate actual session and onboarding state when that integration is built.

The SVG remains responsive, has an accessible description, and supports reduced motion. No extra landing sections are added.

## Correction: a container is not a layout

Wrapping the existing two-column hero in one rounded panel was rejected. The
user's words: "you just gave it a border you didn't actually change anything."
A shared background does not unify a layout — the arrangement has to change.

## Bento hero: three cards

Reference the user supplied: the Outcrowd "Fiscal" landing page, for its three
card structure, in Watchlist's colours and with Watchlist's vector. Not a 1:1
copy.

- **Showcase card** (`--color-surface`, spans both rows): headline, the two-line
  description, both calls to action, and the isometric board anchored to the
  card's floor, cropped by its bottom and right edges.
- **Brand card** (`--color-brand`): "Measured against the market", with two
  illustrative one-year paths that both climb while the benchmark stays above.
- **Ink card** (`--color-ink`): "Your stocks, one list", with ticker chips.

The page itself is white so the cards read as objects on it, and the header sits
outside them.

Colour rules hold inside the new cards. The maroon card is a brand surface; the
two paths on it are drawn in the brand foreground at different opacities because
they carry identity — which line is which — not direction. NVDA's chip is maroon
for the same reason the illustration's NVDA tile is: selection, not gain. No
green or red appears on either small card.

Two content decisions came out of the layout:

- The explanation paragraph ("Put your stocks in context…") was cut from the
  showcase card. The reference's big card carries a headline and a button only,
  and with the paragraph in place the drawing had roughly 280px of height left,
  far too little to read.
- The detached "−3.4 pp" slip was removed from the SVG. The brand card now tells
  that story, so keeping both duplicated it — and being the drawing's rightmost
  element, the slip was what prevented cropping the board at all.

The drawing is positioned out of flow and cropped by the card, so it can never
stretch the card to fit it. Its bottom crop is set with a negative margin in
percent, which resolves against width — so the amount cropped stays constant at
any viewport height. Anchoring by `top` percentage does not: on a tall viewport
the drawing floats clear of the floor and the crop disappears.

## Push exception

For this hero, the user's explicit instruction overrides the normal automatic-push rule: keep implementation commits local until the user tells us to push. Send the hero changes in one push after that instruction. Creating the remote branch at the unchanged base was authorized separately. Do not merge into `main` as part of this work.

## Earlier verification

The illustrated revision passes TypeScript, ESLint, and a production build with Webpack. Visually checked in Chrome at desktop size and a 390 × 844 responsive viewport, including the illustration and footer below the fold. The SVG replaces the first draft's client-side comparison controls; the hero needs no client state or market API calls.

## Verification

The bento revision passes TypeScript, ESLint, and a production build. Checked in
Chrome at 1990 × 1040, 1440 × 900, 1024 × 820 and 390 × 844; below 760px the
three cards stack and hug their content. Still no client state and no market API
calls.

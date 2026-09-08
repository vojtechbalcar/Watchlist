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

## Integrating the illustration into the hero

The illustration read as a sticker parked beside the copy: two columns with a
visible seam, the drawing floating in its own empty space. Placing it in a
containing panel is what unified it — not moving it closer to the text.

The hero is now one rounded panel on a white page: `--color-surface-raised` for
the page, `--color-surface` for the panel, header outside it. The panel holds the
headline and the drawing together, and the panel's bottom edge crops the board's
near corner so the object continues past the frame instead of ending in mid-air.
Reference the user supplied: the Outcrowd "Fiscal" landing page, for the feel of
a single container, not a 1:1 copy.

Supporting moves: the SVG's `viewBox` was tightened from `0 0 680 610` to
`34 138 622 444` (roughly 30% of its height was empty margin, which is why the
drawing looked small and adrift); the drawing reaches back under the copy column;
a soft white-and-maroon light field sits behind it so the board reads as lit.
Maroon there is brand decoration, never direction.

Two labels were removed or moved because they read as defects, not detail: the
board's `01 / COMPARE` index was almost entirely hidden behind the raised MSFT
tile and rendered as "ARE", and the `1Y` timeframe was clipped by the comparison
slip. `01 / COMPARE` is gone; `1Y` moved left to clear the slip.

Two constraints govern the placement at every width. The `−3.4 pp` slip is the
payoff and must stay whole inside the panel, so the drawing never bleeds off the
right. Only the board's bottom corner — plain geometry, no text — is cropped.

## Correction: do not bleed by the page gutter

An earlier attempt bled the drawing to the viewport edge by adding the page
gutter to its width. The gutter is `max(24px, (100vw - 1376px) / 2)`, which grows
without limit once the content is capped at 1376px, so on a ~1990px screen the
drawing inflated to nearly double its size. The user's words: "way too big."
Size the drawing from its column, never from the gutter. This was only visible on
a wide viewport — check one before calling a hero layout done.

## Push exception

For this hero, the user's explicit instruction overrides the normal automatic-push rule: keep implementation commits local until the user tells us to push. Send the hero changes in one push after that instruction. Creating the remote branch at the unchanged base was authorized separately. Do not merge into `main` as part of this work.

## Earlier verification

The illustrated revision passes TypeScript, ESLint, and a production build with Webpack. Visually checked in Chrome at desktop size and a 390 × 844 responsive viewport, including the illustration and footer below the fold. The SVG replaces the first draft's client-side comparison controls; the hero needs no client state or market API calls.

## Verification

The panel revision passes TypeScript, ESLint, and a production build. Checked in
Chrome at 1990 × 1040, 1440 × 900, 1024 × 820 and 390 × 844: the slip stays whole
and the bottom crop reads as deliberate at each. Still no client state and no
market API calls.

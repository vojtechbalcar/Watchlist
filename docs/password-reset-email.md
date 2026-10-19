---
type: decision
updated: 2026-10-19
status: current
---

# Password reset email

Related: [[password-reset]], [[mobbin-app-design]], [[mobbin-landing-design]], [[account-security]]

## User direction

The user corrected the browser-default reset email: account email must follow
the same Mobbin principles as Watchlist's interface.

## Design

- White canvas, a 520px-wide soft gray panel with 24px corners, Helvetica Neue
  with local system fallbacks, and generous spacing.
- Ink text and a black pill labelled **Reset password**. Maroon is reserved
  for the wordmark and heading periods. Secondary text uses the app's
  `#595959` for contrast on the gray surface.
- A hidden inbox preview, the single-use link's actual expiry, a copyable
  fallback URL, and the existing reassurance for an unrequested reset.
- Presentation tables and inline styles carry the layout. A small media
  query reduces padding on phones; Outlook conditional markup constrains
  the width and supplies button padding. No images, remote fonts, or tracking.
- The plain-text alternative and Resend transport remain in place. The URL
  is escaped independently in both HTML links and retained verbatim in text.

## Merged with a second design (2026-10-19)

Two branches designed this email at once: #12 (this design, merged first and
in production) and #13. Merging #13 kept #12's layout, button label, Outlook
markup, phone padding and `#595959` text, and added from #13:

- **The header logo's wordmark.** Lowercase "watchlist" in bold text over a
  maroon bar, in the colours baked into `public/WachlistHeaderLogo.svg`. It
  replaced the "Watchlist." text mark so the email matches the app header.
  The SVG itself was rejected because Gmail and Outlook drop SVG.
- **The auth pages' footer.** "Made for watching. · Privacy", linking the
  privacy notice on the same host as the reset link.
- **`passwordResetEmail(link)`**, which returns the subject, text and HTML
  without sending, so the design is tested directly.

Rejected from #13: its `#707070` secondary text (weaker contrast on the gray
panel than `#595959`), the "Choose a new password ↗" button label (it
repeated the heading, and the arrow suggests an external site), and its
unconditional layout without Outlook width and padding fixes.

Rejected: the unstyled paragraph email, a maroon action button, decorative
charts, and image-dependent branding. This is an account recovery message;
the action and security details lead.

## Verification

The generated outgoing HTML was inspected in the collaborative browser at
desktop and phone widths, including 320px. The long token wraps without
horizontal overflow and both links retain the original destination. No
external assets are requested. Email tests cover escaped button/fallback
URLs and the plain-text alternative. Browser rendering does not replace
testing in an actual inbox; no email was sent during this check.

After the merge with #13, a test checks the palette, the privacy link, and
that no remote content is loaded. The full suite, typecheck, ESLint and the
Next.js production build pass.

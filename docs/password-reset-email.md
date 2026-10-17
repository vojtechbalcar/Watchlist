---
type: decision
updated: 2026-10-17
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

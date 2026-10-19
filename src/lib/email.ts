import { RESET_LINK_MINUTES } from "./password-reset";

/**
 * Sends account email through Resend's API. Needs RESEND_API_KEY and
 * EMAIL_FROM, an address on a domain verified in Resend. Leave the domain's
 * click and open tracking off (Resend's default): tracking would rewrite the
 * reset link, and the privacy notice promises no tracking.
 */
async function send({ to, subject, text, html }: { to: string; subject: string; text: string; html: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    // Local development works without an account: the link goes to the terminal.
    if (process.env.NODE_ENV === "development") {
      console.info(`[email] Resend isn't configured. To ${to}: ${subject}\n${text}`);
      return;
    }
    throw new Error("RESEND_API_KEY and EMAIL_FROM must be set to send email.");
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, text, html }),
  });
  if (!response.ok) {
    const result = (await response.json().catch(() => ({}))) as { name?: string; message?: string };
    throw new Error(`Resend rejected the email (${response.status} ${result.name ?? response.statusText}): ${result.message ?? ""}`);
  }
}

const escape = (value: string) => value.replace(/[&<>"']/g, char => `&#${char.charCodeAt(0)};`);

// The app's palette (src/app/globals.css). Maroon is brand only: the wordmark and the heading's period.
const ink = "#141414";
const muted = "#707070";
const surface = "#f3f3f3";
const brand = "#8c3b52";
// Baked into public/WachlistHeaderLogo.svg, which this rebuilds.
const wordmarkInk = "#241f21";
const wordmarkBrand = "#a63d57";
// Single quotes: it goes inside double-quoted style attributes.
const font = "'Helvetica Neue',Helvetica,Arial,sans-serif";

/**
 * Laid out with tables and inline styles, which every mail client renders.
 * No images, web fonts, or stylesheets: nothing loads when the email opens, so
 * it can't act as a tracking pixel, and the SVG wordmark (which Gmail and
 * Outlook drop) is rebuilt from text over its maroon bar.
 */
export function passwordResetEmail(link: string) {
  const href = escape(link);
  const privacy = escape(new URL("/privacy", link).href);
  const subject = "Reset your Watchlist password";
  const text = [
    "Someone asked to reset the password for your Watchlist account.",
    "",
    `Choose a new password here. The link works once, for ${RESET_LINK_MINUTES} minutes:`,
    link,
    "",
    "If it wasn't you, ignore this email. Your password stays the same.",
  ].join("\n");
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:${font};">
<div style="display:none;max-height:0;overflow:hidden;">The link works once, for ${RESET_LINK_MINUTES} minutes.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;font-family:${font};color:${ink};">
<tr><td style="padding:0 8px 24px;">
<span style="display:inline-block;font-size:22px;line-height:1;font-weight:700;letter-spacing:-0.02em;color:${wordmarkInk};border-bottom:5px solid ${wordmarkBrand};padding-bottom:4px;">watchlist</span>
</td></tr>
<tr><td style="background-color:${surface};border-radius:24px;padding:40px 32px;">
<p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:${muted};">Password reset</p>
<h1 style="margin:0 0 16px;font-size:32px;line-height:1.13;font-weight:700;color:${ink};">Choose a new password<span style="color:${brand};">.</span></h1>
<p style="margin:0 0 32px;font-size:16px;line-height:1.5;font-weight:300;color:${muted};">Someone asked to reset the password for your watchlist account. The link works once, for ${RESET_LINK_MINUTES} minutes.</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="background-color:${ink};border-radius:9999px;">
<a href="${href}" style="display:inline-block;padding:14px 24px;font-family:${font};font-size:16px;font-weight:500;line-height:1.5;color:#ffffff;text-decoration:none;border-radius:9999px;">Choose a new password&nbsp;&nbsp;&#8599;</a>
</td></tr></table>
<p style="margin:32px 0 8px;font-size:14px;line-height:1.5;color:${muted};">Button not working? Paste this link into your browser:</p>
<p style="margin:0;font-size:14px;line-height:1.5;word-break:break-all;"><a href="${href}" style="color:${ink};text-decoration:underline;">${href}</a></p>
</td></tr>
<tr><td style="padding:24px 8px 0;font-size:14px;line-height:1.5;color:${muted};">If it wasn't you, ignore this email. Your password stays the same.</td></tr>
<tr><td style="padding:32px 8px 0;font-size:12px;line-height:1.5;color:${muted};">Made for watching. &middot; <a href="${privacy}" style="color:${ink};text-decoration:underline;">Privacy</a></td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
  return { subject, text, html };
}

export async function sendPasswordResetEmail(to: string, link: string) {
  await send({ to, ...passwordResetEmail(link) });
}

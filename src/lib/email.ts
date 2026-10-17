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

const font = `'Helvetica Neue',Helvetica,Arial,sans-serif`;

/** An ink pill, like the app's primary action. */
function button(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#141414" style="border-radius:9999px;background:#141414;mso-padding-alt:16px 28px;">
<a href="${escape(href)}" style="display:inline-block;padding:16px 28px;border-radius:9999px;font-family:${font};font-size:16px;line-height:20px;font-weight:500;color:#ffffff;text-decoration:none;">${escape(label)}</a>
</td></tr></table>`;
}

/**
 * The shared shell for account email, following the app's Mobbin language
 * (DESIGN.md): white canvas, a soft #f3f3f3 panel with 24px corners, ink text,
 * no shadows, and maroon only for brand accents. Tables and inline
 * styles because mail clients drop most CSS.
 */
function layout({ preview, body, footnote }: { preview: string; body: string; footnote: string }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Watchlist</title>
<style>
@media only screen and (max-width:480px) {
  .email-panel { padding:32px 24px !important; }
}
</style>
</head>
<body style="margin:0;padding:0;background:#ffffff;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escape(preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;">
<tr><td align="center" style="padding:32px 16px;font-family:${font};color:#141414;">
<!--[if mso]><table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;table-layout:fixed;">
<tr><td style="padding:0 8px 24px;font-size:20px;line-height:24px;font-weight:700;color:#141414;">Watchlist<span style="color:#8c3b52;">.</span></td></tr>
<tr><td class="email-panel" bgcolor="#f3f3f3" style="padding:40px 32px;border-radius:24px;background:#f3f3f3;">
${body}
</td></tr>
<tr><td style="padding:24px 8px 0;font-size:14px;line-height:20px;color:#595959;">${escape(footnote)}</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;
}

export async function sendPasswordResetEmail(to: string, link: string) {
  const text = [
    "Someone asked to reset the password for your Watchlist account.",
    "",
    `Choose a new password here. The link works once, for ${RESET_LINK_MINUTES} minutes:`,
    link,
    "",
    "If it wasn't you, ignore this email. Your password stays the same.",
  ].join("\n");
  const html = layout({
    preview: `Choose a new password. The link works once, for ${RESET_LINK_MINUTES} minutes.`,
    body: `<p style="margin:0 0 24px;font-size:14px;line-height:20px;color:#595959;">Password reset</p>
<h1 style="margin:0 0 16px;font-size:32px;line-height:36px;font-weight:700;color:#141414;">Choose a new password<span style="color:#8c3b52;">.</span></h1>
<p style="margin:0 0 32px;font-size:16px;line-height:24px;color:#595959;">Someone asked to reset the password for your Watchlist account. The link works once, for ${RESET_LINK_MINUTES} minutes.</p>
${button(link, "Reset password")}
<p style="margin:32px 0 8px;font-size:13px;line-height:20px;color:#595959;">If the button doesn't work, paste this link into your browser:</p>
<p style="margin:0;font-size:13px;line-height:20px;word-break:break-all;overflow-wrap:anywhere;"><a href="${escape(link)}" style="color:#141414;text-decoration:underline;word-break:break-all;overflow-wrap:anywhere;">${escape(link)}</a></p>`,
    footnote: "If it wasn't you, ignore this email. Your password stays the same.",
  });
  await send({ to, subject: "Reset your Watchlist password", text, html });
}

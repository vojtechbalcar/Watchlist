import { RESET_LINK_MINUTES } from "./password-reset";

/**
 * Sends account email through Postmark's API. Needs POSTMARK_SERVER_TOKEN and
 * EMAIL_FROM, an address on a domain or sender signature confirmed in
 * Postmark. Link and open tracking stay off: tracking would rewrite the reset
 * link, and the privacy notice promises no tracking.
 */
async function send({ to, subject, text, html }: { to: string; subject: string; text: string; html: string }) {
  const token = process.env.POSTMARK_SERVER_TOKEN;
  const from = process.env.EMAIL_FROM;
  if (!token || !from) {
    // Local development works without an account: the link goes to the terminal.
    if (process.env.NODE_ENV === "development") {
      console.info(`[email] Postmark isn't configured. To ${to}: ${subject}\n${text}`);
      return;
    }
    throw new Error("POSTMARK_SERVER_TOKEN and EMAIL_FROM must be set to send email.");
  }
  const response = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", "X-Postmark-Server-Token": token },
    body: JSON.stringify({ From: from, To: to, Subject: subject, TextBody: text, HtmlBody: html, MessageStream: "outbound", TrackLinks: "None", TrackOpens: false }),
  });
  const result = (await response.json().catch(() => ({}))) as { ErrorCode?: number; Message?: string };
  if (!response.ok || result.ErrorCode !== 0) throw new Error(`Postmark rejected the email (${result.ErrorCode ?? response.status}): ${result.Message ?? response.statusText}`);
}

const escape = (value: string) => value.replace(/[&<>"']/g, char => `&#${char.charCodeAt(0)};`);

export async function sendPasswordResetEmail(to: string, link: string) {
  const text = [
    "Someone asked to reset the password for your Watchlist account.",
    "",
    `Choose a new password here. The link works once, for ${RESET_LINK_MINUTES} minutes:`,
    link,
    "",
    "If it wasn't you, ignore this email. Your password stays the same.",
  ].join("\n");
  const html = `<p>Someone asked to reset the password for your Watchlist account.</p>
<p><a href="${escape(link)}">Choose a new password</a>. The link works once, for ${RESET_LINK_MINUTES} minutes.</p>
<p>If it wasn't you, ignore this email. Your password stays the same.</p>`;
  await send({ to, subject: "Reset your Watchlist password", text, html });
}

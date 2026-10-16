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

import { defineCloudflareConfig, type OpenNextConfig } from "@opennextjs/cloudflare";

const config = {
  ...defineCloudflareConfig(),
  // `pnpm run build` runs OpenNext, so OpenNext must not call it back.
  buildCommand: "next build",
  dangerous: {
    // Auth.js renews the session in the proxy. POST actions must be able to
    // replace/delete that cookie, especially logout, as they do in Next dev.
    headersAndCookiesPriority: (event) => event.method === "POST" ? "handler" : "middleware",
  },
} satisfies OpenNextConfig;

export default config;

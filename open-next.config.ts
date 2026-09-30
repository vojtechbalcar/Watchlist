import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default {
  ...defineCloudflareConfig(),
  // `pnpm run build` runs OpenNext, so OpenNext must not call it back.
  buildCommand: "next build",
};

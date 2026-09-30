import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = {
  ...defineCloudflareConfig(),
  // `pnpm run build` runs OpenNext, so OpenNext must not call it back.
  buildCommand: "next build",
};

export default config;

import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // These ship Workers builds under a `workerd` export (Prisma's .wasm loader, pg's socket).
  // Left external, OpenNext resolves them for workerd; bundled, Next would pick the Node build.
  serverExternalPackages: ["@prisma/client", ".prisma/client", "pg", "pg-cloudflare"],
};

initOpenNextCloudflareForDev();

export default nextConfig;

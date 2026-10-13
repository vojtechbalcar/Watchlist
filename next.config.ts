import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const development = process.env.NODE_ENV === "development";

/**
 * Next inlines its bootstrap scripts and styles, so those need 'unsafe-inline'
 * (and the dev server's hot reload needs eval and a websocket). Images may be
 * company logos Twelve Data hosts for stocks outside the tracked set.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${development ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self'${development ? " ws: wss:" : ""}`,
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  // These ship Workers builds under a `workerd` export (Prisma's .wasm loader, pg's socket).
  // Left external, OpenNext resolves them for workerd; bundled, Next would pick the Node build.
  serverExternalPackages: ["@prisma/client", ".prisma/client", "pg", "pg-cloudflare"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

initOpenNextCloudflareForDev();

export default nextConfig;

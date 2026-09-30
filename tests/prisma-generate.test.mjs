import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));

test("Prisma generates the client without database credentials at install time", (t) => {
  // Isolate dotenv from the developer's .env files as well as the shell environment.
  const fixture = mkdtempSync(join(tmpdir(), "watchlist-prisma-generate-"));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  mkdirSync(join(fixture, "prisma"));
  for (const file of ["package.json", "prisma.config.ts", "prisma/schema.prisma"]) {
    copyFileSync(join(root, file), join(fixture, file));
  }
  symlinkSync(join(root, "node_modules"), join(fixture, "node_modules"), "dir");

  const env = { ...process.env };
  delete env.DATABASE_URL;
  env.NO_COLOR = "1";
  const result = spawnSync(process.execPath, [join(root, "node_modules/prisma/build/index.js"), "generate"], {
    cwd: fixture,
    env,
    encoding: "utf8",
    timeout: 30_000,
  });

  assert.ifError(result.error);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /Generated Prisma Client/);
});

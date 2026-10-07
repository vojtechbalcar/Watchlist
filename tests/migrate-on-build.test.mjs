import assert from "node:assert/strict";
import test from "node:test";
import { migrationStep } from "../scripts/migrate.mjs";

test("Cloudflare builds with database credentials apply pending migrations", () => {
  assert.equal(migrationStep({ WORKERS_CI: "1", DATABASE_URL: "postgres://x" }), "migrate");
  assert.equal(migrationStep({ CI: "true", DATABASE_URL: "postgres://x" }), "migrate");
});

test("a Cloudflare build without credentials warns instead of failing the deploy", () => {
  assert.equal(migrationStep({ WORKERS_CI: "1" }), "warn");
  assert.equal(migrationStep({ WORKERS_CI: "1", DATABASE_URL: "" }), "warn");
});

test("local builds never touch the database, even with credentials in the shell", () => {
  assert.equal(migrationStep({}), "skip");
  assert.equal(migrationStep({ DATABASE_URL: "postgres://x" }), "skip");
  assert.equal(migrationStep({ CI: "false", DATABASE_URL: "postgres://x" }), "skip");
});

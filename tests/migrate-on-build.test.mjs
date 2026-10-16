import assert from "node:assert/strict";
import test from "node:test";
import { migrationStep } from "../scripts/migrate.mjs";

test("Cloudflare builds with database credentials apply pending migrations", () => {
  assert.equal(migrationStep({ WORKERS_CI: "1", DATABASE_URL: "postgres://x" }), "migrate");
  assert.equal(migrationStep({ CI: "true", DATABASE_URL: "postgres://x" }), "migrate");
});

test("a Cloudflare build without credentials fails rather than deploy unmigrated code", () => {
  assert.equal(migrationStep({ WORKERS_CI: "1" }), "fail");
  assert.equal(migrationStep({ WORKERS_CI: "1", DATABASE_URL: "" }), "fail");
});

test("local builds never touch the database, even with credentials in the shell", () => {
  assert.equal(migrationStep({}), "skip");
  assert.equal(migrationStep({ DATABASE_URL: "postgres://x" }), "skip");
  assert.equal(migrationStep({ CI: "false", DATABASE_URL: "postgres://x" }), "skip");
});

test("Cloudflare builds of other branches never migrate, so a pull request can't change the production database", () => {
  assert.equal(migrationStep({ WORKERS_CI: "1", WORKERS_CI_BRANCH: "feature/x", DATABASE_URL: "postgres://x" }), "skip");
  assert.equal(migrationStep({ WORKERS_CI: "1", WORKERS_CI_BRANCH: "feature/x" }), "skip");
});

test("Cloudflare builds of main migrate, or fail without credentials", () => {
  assert.equal(migrationStep({ WORKERS_CI: "1", WORKERS_CI_BRANCH: "main", DATABASE_URL: "postgres://x" }), "migrate");
  assert.equal(migrationStep({ WORKERS_CI: "1", WORKERS_CI_BRANCH: "main" }), "fail");
});

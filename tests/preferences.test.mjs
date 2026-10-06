import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register("./resolve-typescript.mjs", import.meta.url);
const { defaultPreferences, parsePreferences, profileInitials, profileName } = await import("../src/lib/preferences.ts");

test("missing, corrupt, and non-object storage recover to defaults", () => {
  for (const raw of [null, "", "{broken", "null", "[]", "42", '"compact"']) {
    assert.deepEqual(parsePreferences(raw), defaultPreferences);
  }
});

test("invalid fields cannot override valid preferences or defaults", () => {
  const result = parsePreferences(JSON.stringify({
    displayName: "  Alex Morgan  ", density: "compact", compareRange: "10Y",
    showLogos: "false", showCompanyNames: false, watchlistSort: "__proto__",
    sortDirection: "descending", unknown: "ignored",
  }));
  assert.deepEqual(result, {
    ...defaultPreferences, displayName: "Alex Morgan", density: "compact",
    showCompanyNames: false, sortDirection: "descending",
  });
});

test("all supported values survive a storage round trip", () => {
  const custom = {
    ...defaultPreferences, displayName: "Morgan", density: "compact", compareRange: "1M",
    watchlistSort: "vsBenchmarkPct", sortDirection: "descending", watchlistFilter: "Behind",
    showLogos: false, showCompanyNames: false, showGapBars: false,
    showMarketSummary: false, reducedMotion: true,
  };
  assert.deepEqual(parsePreferences(JSON.stringify(custom)), custom);
});

test("stored display names are bounded and initials support whitespace and Unicode", () => {
  assert.equal(parsePreferences(JSON.stringify({ displayName: "A".repeat(100) })).displayName.length, 60);
  assert.equal(profileInitials("alex"), "A");
  assert.equal(profileInitials("Éva Šimková"), "ÉŠ");
  // A third name is ignored: the initials are the first and second name's.
  assert.equal(profileInitials("  Alex  Taylor Morgan "), "AT");
  // Nothing to draw from renders nothing rather than another account's initials.
  assert.equal(profileInitials("  "), "");
});

test("the avatar name prefers the display name, then the account name, then the email", () => {
  const account = { name: "Dana Kovar", email: "dana@example.com" };
  assert.equal(profileName("Pat Riley", account), "Pat Riley");
  assert.equal(profileName("   ", account), "Dana Kovar");
  assert.equal(profileName("", { name: null, email: "dana@example.com" }), "dana@example.com");
  assert.equal(profileName("", { name: "   ", email: "dana@example.com" }), "dana@example.com");
  // An email has no second word, so it contributes a single letter.
  assert.equal(profileInitials(profileName("", { name: null, email: "dana@example.com" })), "D");
});

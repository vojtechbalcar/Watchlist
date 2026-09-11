import assert from "node:assert/strict";
import test from "node:test";
import { defaultPreferences, parsePreferences, profileInitials } from "../src/lib/preferences.ts";

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
  assert.equal(profileInitials("  "), "JR");
  assert.equal(profileInitials("alex"), "A");
  assert.equal(profileInitials("  Alex  Taylor Morgan "), "AM");
  assert.equal(profileInitials("Éva Šimková"), "ÉŠ");
});

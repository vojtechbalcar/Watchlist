import assert from "node:assert/strict";
import test from "node:test";
import { comparisonDomain, comparisonY } from "../src/lib/compare-chart.ts";

test("positive, negative, flat and mixed returns fit the chart with a common zero", () => {
  for (const returns of [[31.2, 13.21, 14.6], [-8.3, -11.3], [-8.3, 31.2, 14.6], [0, 0], []]) {
    const domain = comparisonDomain(returns);
    assert.ok(domain.min <= 0 && domain.max >= 0 && domain.max > domain.min);
    for (const value of returns) {
      const y = comparisonY(value, domain);
      assert.ok(y >= 20 && y <= 210);
      if (value < 0) assert.ok(y > comparisonY(0, domain));
    }
  }
});

test("non-finite data cannot poison the chart domain", () => {
  assert.deepEqual(comparisonDomain([NaN, Infinity, -Infinity]), { min: 0, max: 4 });
});

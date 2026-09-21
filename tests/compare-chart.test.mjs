import assert from "node:assert/strict";
import test from "node:test";
import { comparisonDomain, comparisonPoints, comparisonY } from "../src/lib/compare-chart.ts";

test("positive, negative, flat and mixed returns fit the chart with a common zero", () => {
  for (const returns of [[31.2, 13.21, 14.6], [-8.3, -11.3], [-8.3, 31.2, 14.6], [0, 0], []]) {
    const domain = comparisonDomain(returns);
    assert.ok(domain.min <= 0 && domain.max >= 0 && domain.max > domain.min);
    for (const [index, total] of returns.entries()) {
      const points = comparisonPoints(total, index, domain).split(" ").map(point => point.split(",").map(Number));
      assert.equal(points[0][1], comparisonY(0, domain));
      assert.equal(points.at(-1)[1], comparisonY(total, domain));
      for (const [x, y] of points) assert.ok(x >= 8 && x <= 910 && y >= 20 && y <= 210);
      if (total < 0) assert.ok(points.at(-1)[1] > points[0][1]);
    }
  }
});

test("non-finite data cannot poison the chart domain", () => {
  assert.deepEqual(comparisonDomain([NaN, Infinity, -Infinity]), { min: 0, max: 4 });
});

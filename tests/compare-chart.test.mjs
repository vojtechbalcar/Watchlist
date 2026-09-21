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

test("resizing the plot preserves return endpoints and the shared zero baseline", () => {
  const domain = comparisonDomain([-8.3, 31.2, 14.6]);
  for (const plotWidth of [242, 272, 700, 902]) {
    const points = comparisonPoints(-8.3, 2, domain, plotWidth).split(" ").map(point => point.split(",").map(Number));
    assert.deepEqual(points[0], [8, comparisonY(0, domain)]);
    assert.deepEqual(points.at(-1), [8 + plotWidth, comparisonY(-8.3, domain)]);
    assert.ok(points.every(([x]) => x >= 8 && x <= 8 + plotWidth));
  }
});

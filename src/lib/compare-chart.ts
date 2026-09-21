export type ChartDomain = { min: number; max: number };

// Illustrative demo history normalized to a documented return, not dated prices.
const shape = [0, .12, .2, .17, .3, .35, .28, .44, .52, .5, .66, .74, .7, .86, 1];

export function comparisonDomain(returns: number[]): ChartDomain {
  const finite = returns.filter(Number.isFinite);
  const min = Math.floor(Math.min(0, ...finite) / 4) * 4;
  const max = Math.ceil(Math.max(0, ...finite) / 4) * 4;
  return { min, max: max === min ? min + 4 : max };
}

export function comparisonY(value: number, domain: ChartDomain): number {
  return 210 - (value - domain.min) / (domain.max - domain.min) * 190;
}

export function comparisonPoints(total: number, index: number, domain: ChartDomain): string {
  return shape.map((value, i) => {
    const progress = i / (shape.length - 1);
    const wobble = Math.sin(i * (1.3 + index * .3)) * .045 * Math.sin(progress * Math.PI);
    const fraction = Math.min(1, Math.max(0, value + wobble));
    return `${8 + progress * 902},${comparisonY(fraction * total, domain)}`;
  }).join(" ");
}

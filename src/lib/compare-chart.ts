export type ChartDomain = { min: number; max: number };

export function comparisonDomain(returns: number[]): ChartDomain {
  const finite = returns.filter(Number.isFinite);
  const min = Math.floor(Math.min(0, ...finite) / 4) * 4;
  const max = Math.ceil(Math.max(0, ...finite) / 4) * 4;
  return { min, max: max === min ? min + 4 : max };
}

export function comparisonY(value: number, domain: ChartDomain): number {
  return 210 - (value - domain.min) / (domain.max - domain.min) * 190;
}

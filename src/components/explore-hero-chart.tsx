import type { Direction } from "@/lib/format";

/**
 * The hero stock's shape over the day. Exact vectors from Figma, placeholder
 * geometry until intraday series come from Postgres — see explore-data.ts.
 *
 * The fill reads as distance from the market, so it follows the vs-market
 * direction rather than being decoration.
 */
export function ExploreHeroChart({
  label,
  direction,
}: {
  label: string;
  direction: Direction;
}) {
  const up = direction === "up";

  return (
    <div className="relative w-full">
      <div aria-hidden className="absolute inset-0 flex flex-col justify-between">
        {[0, 1, 2, 3, 4].map((line) => (
          <span key={line} className="block border-t border-line-soft" />
        ))}
      </div>

      <svg
        viewBox="0 0 810 343"
        preserveAspectRatio="none"
        role="img"
        aria-label={label}
        className="relative block h-[342px] w-full"
      >
        <path
          d="M58.0571 242.323L0.557086 265.823V343.323H809.557V1.3229L752.057 31.8229L694.057 87.8229L636.057 64.3229L578.557 125.823L520.057 102.823L464.557 164.823L404.057 141.323L347.057 202.823L290.057 175.823L233.557 233.823L172.557 212.323L115.057 271.823L58.0571 242.323Z"
          fill={up ? "var(--color-up-surface)" : "var(--color-down-surface)"}
        />
        <path
          d="M0.557086 265.323L58.0571 242.323L116.057 272.323L172.557 212.323L233.057 233.823L289.557 175.823L347.557 203.323L404.057 141.323L464.557 164.823L519.557 102.823L578.557 125.823L636.057 64.3229L694.057 87.3229L752.057 32.3229L810.057 1.3229"
          fill="none"
          stroke={up ? "var(--color-up-deep)" : "var(--color-down)"}
          strokeWidth={3}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

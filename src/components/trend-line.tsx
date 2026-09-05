import type { Direction } from "@/lib/format";

/**
 * The 30-day shape in a watchlist row. Exact vectors from Figma (213x38).
 *
 * Figma draws the falling variant as the rising one mirrored horizontally, so
 * this is one geometry with `scale-x-[-1]` rather than two paths. Placeholder
 * geometry until 30-day series come from Postgres — see watchlist-data.ts.
 */
export function TrendLine({ direction }: { direction: Direction }) {
  const up = direction === "up";

  return (
    <span
      aria-hidden
      className={[
        "block w-full",
        up ? "text-up" : "text-down",
        up ? "" : "scale-x-[-1]",
      ].join(" ")}
    >
      <svg
        viewBox="0 0 213 40"
        preserveAspectRatio="none"
        className="block h-[38px] w-full"
      >
        <path
          d="M213 39H0L15.5432 35.5455L32.2378 36.697L49.5081 30.9394L65.0514 34.3939L82.3216 24.6061L101.895 28.0606L119.741 17.697L132.405 19.4242L147.373 10.2121L165.795 12.5152L180.762 3.30303L196.881 6.18182L213 1V39Z"
          fill={up ? "var(--color-up-surface)" : "var(--color-down-surface)"}
        />
        <path
          d="M0.201167 38.95L15.8821 35.7297L32.439 36.647L49.2042 31.2212L65.5386 34.4416L82.5263 24.1365L102.128 28.0009L119.769 17.6958L132.183 19.628L147.864 9.96698L166.158 12.5432L181.186 2.88223L197.52 6.10257L213.201 0.950028"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}

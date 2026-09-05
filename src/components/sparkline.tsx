import type { Direction } from "@/lib/format";

/**
 * Intraday shape for one holding. Exact vectors from Figma; placeholder
 * geometry until intraday series come from Postgres. Colour follows market
 * direction, never brand.
 */
export function Sparkline({ direction }: { direction: Direction }) {
  const stroke = direction === "up" ? "var(--color-up)" : "var(--color-down-deep)";
  return (
    <svg
      viewBox="0 0 267.34 75"
      preserveAspectRatio="none"
      aria-hidden
      className="block h-[75px] w-full"
    >
      <path
        d="M0 75V0L9.79 3.57143L15.13 10.7143L24.03 14.2857L32.93 20.2381L46.28 15.4762L55.18 3.57143L68.53 14.2857L72.98 23.8095L80.99 17.8571L90.78 21.4286L106.8 33.3333L115.7 26.1905L117.48 17.8571L127.27 10.7143L140.62 20.2381L142.4 26.1905L149.52 28.5714L153.08 33.3333L160.2 35.7143L166.43 30.9524L172.66 35.7143L179.78 33.3333L201.14 40.4762L212.71 36.9048L217.16 40.4762L224.28 42.8571L227.84 40.4762L234.07 38.0952L237.63 40.4762L242.08 42.8571L245.64 46.4286L267 54.7619V75H0Z"
        fill={stroke}
        fillOpacity="0.11"
      />
      <path
        d="M0.16936 0.470444L10.1331 4.0574L15.2983 10.9969L24.1976 14.2007L33.097 21.1038L46.446 16.2981L55.5569 4.0574L68.6334 14.2007L73.1441 24.6972L81.1535 18.4844L91.8327 22.3289L106.813 33.9487L115.861 26.9301L117.545 18.4844L127.198 10.9969L140.228 21.1038L142.731 26.9301L149.679 29.431L153.041 33.9487L160.358 36.5827L166.587 31.7505L172.817 36.5827L180.134 33.9487L189.726 37.4018L201.295 41.5667L212.864 37.4018L218.233 41.5667L224.433 43.7986L228.883 40.3471L234.222 38.4248L238.273 41.5667L242.232 42.9919L245.792 47.7745L252.021 50.0171L267.169 55.4704"
        fill="none"
        stroke={stroke}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

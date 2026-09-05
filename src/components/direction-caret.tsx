import type { Direction } from "@/lib/format";

/**
 * The solid triangle that carries the sign of a move. Exact vector from Figma
 * (16x14 up; the down caret is the same triangle rotated).
 *
 * `tone="neutral"` is the default in the TODAY column, where the caret alone
 * says up or down and the number stays muted. `tone="direction"` inherits
 * currentColor for the places that colour the mark itself.
 */
export function DirectionCaret({
  direction,
  tone = "neutral",
  className = "size-[16px]",
}: {
  direction: Direction;
  tone?: "neutral" | "direction";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 14"
      aria-hidden
      className={[
        "block shrink-0",
        direction === "down" ? "rotate-180" : "",
        tone === "neutral" ? "text-text-muted" : "",
        className,
      ].join(" ")}
    >
      <path d="M8.0001 0L0 14H16L8.0001 0Z" fill="currentColor" />
    </svg>
  );
}

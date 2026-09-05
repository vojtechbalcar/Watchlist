import Image from "next/image";

/**
 * The watchlist wordmark. Shipped as a single exported SVG (paths, no live
 * text) so it needs no font and renders identically everywhere.
 *
 * Note the maroon and washed black are baked into the file, not read from
 * --color-brand / --color-ink. Re-export from Figma if the brand colour moves.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Image
      src="/WachlistHeaderLogo.svg"
      alt="watchlist"
      width={157}
      height={52}
      priority
      className={className}
    />
  );
}

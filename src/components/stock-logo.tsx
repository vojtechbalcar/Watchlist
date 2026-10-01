import Image from "next/image";
import { Building2 } from "lucide-react";
import { stockLogoFit, stockLogoSrc } from "@/lib/stock-logos";

/**
 * Tracked stocks use the local monochrome symbols. `remoteSrc` is a Twelve
 * Data logo for a stock found through search; it is a full-colour image, so it
 * fills the tile and is greyed rather than flattened to black.
 */
export function StockLogo({ stock, remoteSrc }: { stock: { ticker: string }; remoteSrc?: string | null }) {
  const src = stockLogoSrc(stock.ticker);
  return <span className="stock-logo" data-ticker={stock.ticker} data-fit={stockLogoFit(stock.ticker)} aria-hidden="true">
    {src ? <Image src={src} alt="" width={28} height={28} />
      : remoteSrc ? <Image src={remoteSrc} alt="" width={40} height={40} unoptimized data-remote="" />
      : <Building2 size={24} strokeWidth={1.5} />}
  </span>;
}

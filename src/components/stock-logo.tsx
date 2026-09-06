import Image from "next/image";
import type { Holding } from "@/lib/watchlist-data";

export function StockLogo({ stock }: { stock: Pick<Holding, "ticker" | "logoSrc"> }) {
  return <span className="stock-logo" data-ticker={stock.ticker} aria-hidden="true">
    {stock.logoSrc ? <Image src={stock.logoSrc} alt="" width={28} height={28} /> :
      stock.ticker === "META" ? "m" : stock.ticker === "GOOGL" ? "G" : stock.ticker.slice(0, 1)}
  </span>;
}

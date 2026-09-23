import Image from "next/image";
import { Building2 } from "lucide-react";
import { stockLogoFit, stockLogoSrc } from "@/lib/stock-logos";

export function StockLogo({ stock }: { stock: { ticker: string } }) {
  const src = stockLogoSrc(stock.ticker);
  return <span className="stock-logo" data-ticker={stock.ticker} data-fit={stockLogoFit(stock.ticker)} aria-hidden="true">
    {src ? <Image src={src} alt="" width={28} height={28} /> : <Building2 size={24} strokeWidth={1.5} />}
  </span>;
}

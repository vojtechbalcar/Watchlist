import styles from "@/app/landing/landing.module.css";

const plane = "matrix(.94 .34 -.48 .68 222 146)";
const project = (x: number, y: number) => [222 + .94 * x - .48 * y, 146 + .34 * x + .68 * y];

function StockTile({ x, ticker, name, selected = false }: { x: number; ticker: string; name: string; selected?: boolean }) {
  const [leftX, leftY] = project(x, 164);
  const [frontX, frontY] = project(x + 102, 164);
  const [rightX, rightY] = project(x + 102, 82);

  return (
    <g transform={`translate(0 ${selected ? -76 : -54})`}>
      <path d={`M${leftX} ${leftY} ${frontX} ${frontY}v13L${leftX} ${leftY + 13}Z`} fill={selected ? "#693043" : "#eef0f2"} stroke="var(--color-ink)" strokeWidth="1.3" strokeLinejoin="round" />
      <path d={`M${frontX} ${frontY} ${rightX} ${rightY}v13L${frontX} ${frontY + 13}Z`} fill={selected ? "#77344a" : "#fafbfc"} stroke="var(--color-ink)" strokeWidth="1.3" strokeLinejoin="round" />
      <g transform={plane}>
        <rect x={x} y="82" width="102" height="82" rx="3" fill={selected ? "var(--color-brand)" : "var(--color-surface-raised)"} stroke="var(--color-ink)" strokeWidth="1.6" />
        <g fill="none" stroke={selected ? "var(--color-brand-foreground)" : "var(--color-ink)"} strokeWidth="1.4">
          <rect x={x + 14} y="95" width="17" height="17" rx="3" />
          {selected ? <path d={`m${x + 18} 103 3 3 6-6`} /> : <path d={`M${x + 18} 107v-5m4 5v-8m4 8v-4`} />}
        </g>
        <text x={x + 14} y="137" fill={selected ? "var(--color-brand-foreground)" : "var(--color-ink)"} fontSize="19" fontWeight="500" letterSpacing="-.5">{ticker}</text>
        <text x={x + 14} y="153" fill={selected ? "#efdae1" : "var(--color-text-secondary)"} fontSize="9">{name}</text>
      </g>
    </g>
  );
}

/** Original line illustration of stock selection and benchmark comparison. */
export function LandingIllustration() {
  return (
    <svg className={styles.illustration} viewBox="34 138 584 444" role="img" aria-labelledby="landing-art-title landing-art-description">
      <title id="landing-art-title">A closer look at your watchlist.</title>
      <desc id="landing-art-description">An isometric comparison board with three raised stock tiles. The selected stock is marked in maroon. An illustrative comparison shows the stock up 18.7 percent and the benchmark up 22.1 percent, leaving the stock 3.4 percentage points behind.</desc>

      {/* The base and its shallow edges give the drawing the weight of an object. */}
      <path d="m44 425 368 134 182-251 16 9-187 255-383-141z" fill="#e5e7e9" opacity=".6" />
      <path d="m39.6 404.4 376 136v17l-376-136z" fill="#f1f2f4" stroke="var(--color-ink)" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="m415.6 540.4 182.4-258.4v17L415.6 557.4z" fill="#e5e8eb" stroke="var(--color-ink)" strokeWidth="1.4" strokeLinejoin="round" />

      <g transform={plane}>
        <rect width="400" height="380" rx="8" fill="var(--color-surface-raised)" stroke="var(--color-ink)" strokeWidth="1.8" />
        <rect x="12" y="12" width="376" height="356" rx="5" fill="#fafbfc" stroke="#d7dade" strokeWidth="1" />
        <image href="/WachlistHeaderLogo.svg" x="28" y="23" width="115" height="38" />
        <path d="M28 68h344" stroke="#d7dade" />

        {/* Recesses ground the raised tiles in a consistent grid. */}
        {[28, 149, 270].map(x => <g key={x}>
          <rect x={x} y="82" width="102" height="82" rx="3" fill="#f0f2f4" stroke="#c8ccd1" />
          <path d={`M${x + 7} 157h88V89`} stroke="#d9dde1" fill="none" />
        </g>)}

        <rect x="28" y="191" width="344" height="147" rx="4" fill="var(--color-ink)" stroke="var(--color-ink)" />
        <text x="45" y="215" fill="#f5f6f8" fontSize="12" fontWeight="500">Stock vs. benchmark</text>
        <text x="326" y="215" textAnchor="end" fill="#d4d7db" fontSize="10">1Y</text>
        <path d="M45 229h307M206 242v57" stroke="#56595f" />
        <text x="45" y="251" fill="#d4d7db" fontSize="10">Your stock</text>
        <text x="224" y="251" fill="#d4d7db" fontSize="10">S&amp;P 500</text>
        <text x="42" y="286" fill="#9ac9b0" fontSize="33" fontWeight="500" letterSpacing="-1.3">+18.7%</text>
        <text x="221" y="286" fill="#9ac9b0" fontSize="33" fontWeight="500" letterSpacing="-1.3">+22.1%</text>
        <path d="M45 304h307" stroke="#56595f" />
        <text x="45" y="324" fill="#d4d7db" fontSize="10">Relative performance</text>
        <text x="352" y="324" textAnchor="end" fill="#efb3b4" fontSize="14" fontWeight="500">−3.4 pp</text>
        <path d="M28 352h47" stroke="var(--color-brand)" strokeWidth="4" />
        <path d="M344 352h28" stroke="#b8bdc3" strokeWidth="2" />
      </g>

      <StockTile x={28} ticker="AAPL" name="Apple" />
      <StockTile x={149} ticker="NVDA" name="NVIDIA" selected />
      <StockTile x={270} ticker="MSFT" name="Microsoft" />

    </svg>
  );
}

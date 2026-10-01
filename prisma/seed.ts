/**
 * Seeds instrument identity — the reference data the stock API does not supply.
 * Prices are never seeded: they come from the cron job and nowhere else.
 */
import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { benchmarkTicker, marketIndexLabels, sectorBenchmarks, trackedStocks, type Sector } from "../src/lib/explore-data.ts";

loadEnv({ path: ".env.local" });
loadEnv();

function benchmark(label: string) {
  return { ticker: benchmarkTicker(label), name: label };
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const labels = [...new Set([...Object.values(sectorBenchmarks), ...marketIndexLabels])];
  for (const label of labels) {
    const { ticker, name } = benchmark(label);
    await prisma.instrument.upsert({
      where: { ticker },
      update: { name, kind: "BENCHMARK" },
      create: { ticker, name, kind: "BENCHMARK" },
    });
  }

  for (const stock of trackedStocks) {
    const measuredAgainst = benchmark(sectorBenchmarks[stock.sector as Sector]).ticker;
    const identity = {
      name: stock.name,
      kind: "STOCK" as const,
      sector: stock.sector,
      currency: stock.currency,
      logoSrc: stock.logoSrc,
      benchmarkTicker: measuredAgainst,
    };
    await prisma.instrument.upsert({
      where: { ticker: stock.ticker },
      update: identity,
      create: { ticker: stock.ticker, ...identity },
    });
  }

  const [benchmarks, stocks] = await Promise.all([
    prisma.instrument.count({ where: { kind: "BENCHMARK" } }),
    prisma.instrument.count({ where: { kind: "STOCK" } }),
  ]);
  console.log(`Seeded ${stocks} stocks and ${benchmarks} benchmarks.`);
  await prisma.$disconnect();
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});

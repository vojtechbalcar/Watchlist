-- CreateEnum
CREATE TYPE "InstrumentKind" AS ENUM ('STOCK', 'BENCHMARK');

-- CreateTable
CREATE TABLE "Instrument" (
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "InstrumentKind" NOT NULL DEFAULT 'STOCK',
    "sector" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "logoSrc" TEXT,
    "benchmarkTicker" TEXT,

    CONSTRAINT "Instrument_pkey" PRIMARY KEY ("ticker")
);

-- CreateTable
CREATE TABLE "DailyClose" (
    "ticker" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "close" DECIMAL(14,4) NOT NULL,

    CONSTRAINT "DailyClose_pkey" PRIMARY KEY ("ticker","date")
);

-- CreateTable
CREATE TABLE "Quote" (
    "ticker" TEXT NOT NULL,
    "price" DECIMAL(14,4) NOT NULL,
    "changeAbs" DECIMAL(14,4) NOT NULL,
    "changePct" DECIMAL(9,4) NOT NULL,
    "asOf" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("ticker")
);

-- CreateIndex
CREATE INDEX "Instrument_kind_sector_idx" ON "Instrument"("kind", "sector");

-- CreateIndex
CREATE INDEX "DailyClose_ticker_date_idx" ON "DailyClose"("ticker", "date" DESC);

-- AddForeignKey
ALTER TABLE "Instrument" ADD CONSTRAINT "Instrument_benchmarkTicker_fkey" FOREIGN KEY ("benchmarkTicker") REFERENCES "Instrument"("ticker") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyClose" ADD CONSTRAINT "DailyClose_ticker_fkey" FOREIGN KEY ("ticker") REFERENCES "Instrument"("ticker") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_ticker_fkey" FOREIGN KEY ("ticker") REFERENCES "Instrument"("ticker") ON DELETE CASCADE ON UPDATE CASCADE;

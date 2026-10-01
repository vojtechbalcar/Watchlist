-- AlterTable
ALTER TABLE "Instrument" ADD COLUMN     "closesCheckedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Listing" (
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "logoUrl" TEXT,
    "logoCheckedAt" TIMESTAMP(3),
    "price" DECIMAL(14,4),
    "changeAbs" DECIMAL(14,4),
    "changePct" DECIMAL(9,4),
    "priceFetchedAt" TIMESTAMP(3),

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("symbol")
);

-- CreateTable
CREATE TABLE "ApiUsage" (
    "bucket" TEXT NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ApiUsage_pkey" PRIMARY KEY ("bucket")
);

-- CreateTable
CREATE TABLE "JobState" (
    "job" TEXT NOT NULL,
    "ranAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobState_pkey" PRIMARY KEY ("job")
);


-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "cik" INTEGER,
ADD COLUMN     "sector" TEXT,
ADD COLUMN     "sectorCheckedAt" TIMESTAMP(3),
ADD COLUMN     "sic" INTEGER;

-- CreateIndex
CREATE INDEX "Listing_sector_idx" ON "Listing"("sector");

-- CreateIndex
CREATE INDEX "Listing_cik_idx" ON "Listing"("cik");


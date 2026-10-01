-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "closes" JSONB,
ADD COLUMN     "closesFetchedAt" TIMESTAMP(3);


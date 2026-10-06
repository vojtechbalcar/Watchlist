-- CreateTable
CREATE TABLE "SavedWatchlist" (
    "userId" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedWatchlist_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "SavedWatchlist" ADD CONSTRAINT "SavedWatchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

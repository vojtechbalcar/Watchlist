-- CreateTable
CREATE TABLE "SavedPreferences" (
    "userId" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedPreferences_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "SavedPreferences" ADD CONSTRAINT "SavedPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

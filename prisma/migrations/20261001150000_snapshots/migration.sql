-- CreateTable
CREATE TABLE "Snapshot" (
    "key" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "builtAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Snapshot_pkey" PRIMARY KEY ("key")
);


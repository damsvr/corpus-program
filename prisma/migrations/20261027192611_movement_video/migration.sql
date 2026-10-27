-- CreateTable
CREATE TABLE "MovementVideo" (
    "key" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "startSec" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovementVideo_pkey" PRIMARY KEY ("key")
);

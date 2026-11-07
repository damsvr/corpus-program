-- AlterTable
ALTER TABLE "SessionLog" ADD COLUMN     "comment" TEXT;

-- CreateTable
CREATE TABLE "SessionVoiceNote" (
    "sessionId" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionVoiceNote_pkey" PRIMARY KEY ("sessionId")
);

-- AddForeignKey
ALTER TABLE "SessionVoiceNote" ADD CONSTRAINT "SessionVoiceNote_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SessionLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

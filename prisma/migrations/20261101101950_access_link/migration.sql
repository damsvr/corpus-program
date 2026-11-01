-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accessLinkId" TEXT;

-- CreateTable
CREATE TABLE "AccessLink" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "profile" "ProfileType" NOT NULL,
    "label" TEXT NOT NULL,
    "blocDebut" INTEGER NOT NULL,
    "blocFin" INTEGER NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccessLink_code_key" ON "AccessLink"("code");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_accessLinkId_fkey" FOREIGN KEY ("accessLinkId") REFERENCES "AccessLink"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Bloc" ADD COLUMN     "optionnel" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Day" ADD COLUMN     "optionnel" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sessionsPerWeek" INTEGER NOT NULL DEFAULT 4;

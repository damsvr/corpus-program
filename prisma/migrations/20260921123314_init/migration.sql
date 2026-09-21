-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('CROSSFIT', 'HYBRID', 'FUNCTIONAL');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'CANCELED', 'NONE');

-- CreateEnum
CREATE TYPE "PalierMateriel" AS ENUM ('SALLE_COMPLETE', 'MINIMALISTE', 'DEPLACEMENT');

-- CreateEnum
CREATE TYPE "WeekType" AS ENUM ('CHARGEE', 'REALISATION', 'DELOAD');

-- CreateEnum
CREATE TYPE "JourType" AS ENUM ('ENTRAINEMENT', 'TAMPON');

-- CreateEnum
CREATE TYPE "ModuleType" AS ENUM ('CHARGE', 'VOLUME', 'MOTEUR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "trialEndsAt" TIMESTAMP(3),
    "activeProfile" "ProfileType" NOT NULL DEFAULT 'CROSSFIT',
    "reminderTime" TEXT DEFAULT '07:00',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prs" (
    "userId" TEXT NOT NULL,
    "arracheKg" DOUBLE PRECISION,
    "epauleJeteKg" DOUBLE PRECISION,
    "backSquatKg" DOUBLE PRECISION,
    "frontSquatKg" DOUBLE PRECISION,
    "souleveDeTerreKg" DOUBLE PRECISION,
    "developpeCoucheKg" DOUBLE PRECISION,
    "developpeMilitaireKg" DOUBLE PRECISION,
    "poidsDeCorpsKg" DOUBLE PRECISION,
    "row2000m" TEXT,
    "course5km" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prs_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "AthleteProfile" (
    "userId" TEXT NOT NULL,
    "limitations" TEXT NOT NULL DEFAULT '',
    "pointsFaibles" TEXT NOT NULL DEFAULT '',
    "mouvementsBloquants" TEXT NOT NULL DEFAULT '',
    "joursDisponibles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "palierMateriel" "PalierMateriel" NOT NULL DEFAULT 'SALLE_COMPLETE',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AthleteProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profile" "ProfileType" NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Week" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "blocNumero" INTEGER NOT NULL,
    "semaineDansBloc" INTEGER NOT NULL,
    "type" "WeekType" NOT NULL,
    "dureeTotaleMin" INTEGER,
    "note" TEXT,
    "rawImportJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Week_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Day" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "jour" INTEGER NOT NULL,
    "slot" INTEGER,
    "jourType" "JourType" NOT NULL DEFAULT 'ENTRAINEMENT',
    "dureeEstimeeMin" INTEGER,
    "titre" TEXT NOT NULL,

    CONSTRAINT "Day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bloc" (
    "id" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "module" "ModuleType",
    "dureeMin" TEXT,
    "isWod" BOOLEAN NOT NULL DEFAULT false,
    "formatEntete" TEXT,
    "note" TEXT,

    CONSTRAINT "Bloc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercice" (
    "id" TEXT NOT NULL,
    "blocId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "notation" TEXT,
    "charge" TEXT,
    "repos" TEXT,
    "note" TEXT,

    CONSTRAINT "Exercice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "module" "ModuleType",
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "durationMin" INTEGER,
    "volumeKg" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "SessionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciceLog" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "exerciceId" TEXT NOT NULL,
    "sets" JSONB NOT NULL,
    "note" TEXT,

    CONSTRAINT "ExerciceLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Program_userId_active_idx" ON "Program"("userId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "Week_programId_numero_key" ON "Week"("programId", "numero");

-- CreateIndex
CREATE INDEX "Day_weekId_jour_idx" ON "Day"("weekId", "jour");

-- CreateIndex
CREATE INDEX "Bloc_dayId_ordre_idx" ON "Bloc"("dayId", "ordre");

-- CreateIndex
CREATE INDEX "Exercice_blocId_ordre_idx" ON "Exercice"("blocId", "ordre");

-- CreateIndex
CREATE INDEX "SessionLog_userId_startedAt_idx" ON "SessionLog"("userId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciceLog_sessionId_exerciceId_key" ON "ExerciceLog"("sessionId", "exerciceId");

-- AddForeignKey
ALTER TABLE "Prs" ADD CONSTRAINT "Prs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AthleteProfile" ADD CONSTRAINT "AthleteProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Week" ADD CONSTRAINT "Week_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Day" ADD CONSTRAINT "Day_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "Week"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bloc" ADD CONSTRAINT "Bloc_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercice" ADD CONSTRAINT "Exercice_blocId_fkey" FOREIGN KEY ("blocId") REFERENCES "Bloc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionLog" ADD CONSTRAINT "SessionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionLog" ADD CONSTRAINT "SessionLog_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciceLog" ADD CONSTRAINT "ExerciceLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SessionLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciceLog" ADD CONSTRAINT "ExerciceLog_exerciceId_fkey" FOREIGN KEY ("exerciceId") REFERENCES "Exercice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "CycleCalendar" (
    "userId" TEXT NOT NULL,
    "blocNumero" INTEGER NOT NULL,
    "startsOn" DATE NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CycleCalendar_pkey" PRIMARY KEY ("userId","blocNumero")
);

-- AddForeignKey
ALTER TABLE "CycleCalendar" ADD CONSTRAINT "CycleCalendar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

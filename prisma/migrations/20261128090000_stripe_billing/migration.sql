-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'PAST_DUE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "signupSource" TEXT,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripePriceId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ALTER COLUMN "subscriptionStatus" SET DEFAULT 'NONE';

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");


-- Données : « TRIALING » n'était qu'une valeur par défaut sans abonnement Stripe.
UPDATE "User" SET "subscriptionStatus" = 'NONE' WHERE "subscriptionStatus" = 'TRIALING' AND "stripeSubscriptionId" IS NULL;

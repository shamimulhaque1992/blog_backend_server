/*
  Warnings:

  - A unique constraint covering the columns `[stripeSubscribeId]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stripeSubscribeId` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "stripeSubscribeId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscribeId_key" ON "subscriptions"("stripeSubscribeId");

/*
  Warnings:

  - You are about to drop the column `currentPeriod` on the `subscriptions` table. All the data in the column will be lost.
  - Added the required column `currentPeriodEnd` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "currentPeriod",
ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3) NOT NULL;

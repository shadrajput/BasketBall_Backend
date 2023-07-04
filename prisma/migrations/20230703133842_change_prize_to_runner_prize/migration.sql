/*
  Warnings:

  - You are about to drop the column `prize` on the `tournaments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tournaments" DROP COLUMN "prize",
ADD COLUMN     "winner_prize" TEXT;

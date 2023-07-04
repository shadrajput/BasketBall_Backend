/*
  Warnings:

  - Added the required column `type` to the `tournament_referees` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tournament_referees" ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tournaments" ADD COLUMN     "runner_prize" TEXT;

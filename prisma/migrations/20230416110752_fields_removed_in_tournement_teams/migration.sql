/*
  Warnings:

  - You are about to drop the column `is_disqualified` on the `tournament_teams` table. All the data in the column will be lost.
  - You are about to drop the column `is_knockout_upperhalf` on the `tournament_teams` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `tournament_teams` table. All the data in the column will be lost.
  - You are about to drop the column `pool_name` on the `tournament_teams` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tournament_teams" DROP COLUMN "is_disqualified",
DROP COLUMN "is_knockout_upperhalf",
DROP COLUMN "points",
DROP COLUMN "pool_name";

-- AlterTable
ALTER TABLE "tournament_teams_reg_type" ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;

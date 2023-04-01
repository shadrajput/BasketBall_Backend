/*
  Warnings:

  - The `gender_type` column on the `tournament_teams` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "tournament_teams" DROP COLUMN "gender_type",
ADD COLUMN     "gender_type" TEXT[];

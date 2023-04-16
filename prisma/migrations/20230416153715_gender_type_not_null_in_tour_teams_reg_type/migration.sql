/*
  Warnings:

  - Made the column `gender_type` on table `tournament_teams_reg_type` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "tournament_teams_reg_type" ALTER COLUMN "gender_type" SET NOT NULL;

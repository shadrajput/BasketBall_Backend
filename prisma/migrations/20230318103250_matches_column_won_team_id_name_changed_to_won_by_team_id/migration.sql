/*
  Warnings:

  - You are about to drop the column `won_team_id` on the `matches` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "won_team";

-- AlterTable
ALTER TABLE "matches" DROP COLUMN "won_team_id",
ADD COLUMN     "won_by_team_id" INTEGER;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "won_team" FOREIGN KEY ("won_by_team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

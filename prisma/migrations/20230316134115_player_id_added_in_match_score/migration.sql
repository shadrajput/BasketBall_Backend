/*
  Warnings:

  - Added the required column `player_id` to the `match_score` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "match_quarters" ALTER COLUMN "team_1_points" SET DEFAULT 0,
ALTER COLUMN "team_2_points" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "match_score" ADD COLUMN     "player_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "match_score" ADD CONSTRAINT "players_table" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

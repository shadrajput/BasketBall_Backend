/*
  Warnings:

  - Added the required column `captain_id` to the `teams` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "captain_id" INTEGER NOT NULL;

-- RenameForeignKey
ALTER TABLE "tournament_referees" RENAME CONSTRAINT "tournament_table" TO "player_table";

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "players_table" FOREIGN KEY ("captain_id") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

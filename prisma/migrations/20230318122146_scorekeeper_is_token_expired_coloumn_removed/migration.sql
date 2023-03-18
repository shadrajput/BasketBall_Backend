/*
  Warnings:

  - You are about to drop the column `is_token_expired` on the `scorekeeper` table. All the data in the column will be lost.
  - Added the required column `team_id` to the `match_players` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "match_players" ADD COLUMN     "team_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "scorekeeper" DROP COLUMN "is_token_expired";

-- AddForeignKey
ALTER TABLE "match_players" ADD CONSTRAINT "teams_table" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

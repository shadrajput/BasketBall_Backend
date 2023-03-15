/*
  Warnings:

  - You are about to drop the `player_ranking` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "player_ranking" DROP CONSTRAINT "players_table";

-- DropTable
DROP TABLE "player_ranking";

-- CreateTable
CREATE TABLE "player_statistics" (
    "id" SERIAL NOT NULL,
    "matches_played" INTEGER NOT NULL DEFAULT 0,
    "matches_won" INTEGER NOT NULL DEFAULT 0,
    "matches_lost" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "player_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_statistics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "player_statistics" ADD CONSTRAINT "players_table" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

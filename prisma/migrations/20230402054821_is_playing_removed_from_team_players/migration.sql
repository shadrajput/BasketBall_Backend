/*
  Warnings:

  - You are about to drop the column `city` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `is_playing` on the `team_players` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "players" DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "state",
ALTER COLUMN "pincode" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "team_players" DROP COLUMN "is_playing";

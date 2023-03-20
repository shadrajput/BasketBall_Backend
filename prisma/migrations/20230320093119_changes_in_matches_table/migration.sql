/*
  Warnings:

  - You are about to drop the column `quarters` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `start_date_time` on the `matches` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "matches" DROP COLUMN "quarters",
DROP COLUMN "start_date_time",
ADD COLUMN     "quarters_held" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "start_date" DATE,
ADD COLUMN     "start_time" TEXT,
ALTER COLUMN "scorekeeper_id" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL;

/*
  Warnings:

  - You are about to drop the column `quarted_id` on the `match_score` table. All the data in the column will be lost.
  - Added the required column `quarter_id` to the `match_score` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "match_score" DROP CONSTRAINT "match_quarter_table";

-- AlterTable
ALTER TABLE "match_quarters" ADD COLUMN     "is_undo_score" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "match_score" DROP COLUMN "quarted_id",
ADD COLUMN     "quarter_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "match_score" ADD CONSTRAINT "match_quarter_table" FOREIGN KEY ("quarter_id") REFERENCES "match_quarters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

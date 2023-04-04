/*
  Warnings:

  - Added the required column `mobile` to the `players` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "players" ADD COLUMN     "mobile" TEXT NOT NULL;

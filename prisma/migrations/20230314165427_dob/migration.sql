/*
  Warnings:

  - Added the required column `date_of_birth` to the `players` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "players" ADD COLUMN     "date_of_birth" DATE NOT NULL;

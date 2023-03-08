/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Users` table. All the data in the column will be lost.
  - The `is_visitor` column on the `Users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `is_player` column on the `Users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `is_manager` column on the `Users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `is_organizer` column on the `Users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `is_admin` column on the `Users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `is_verified` column on the `Users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[mobile]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "is_visitor",
ADD COLUMN     "is_visitor" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "is_player",
ADD COLUMN     "is_player" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "is_manager",
ADD COLUMN     "is_manager" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "is_organizer",
ADD COLUMN     "is_organizer" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "is_admin",
ADD COLUMN     "is_admin" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "is_verified",
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Players" (
    "id" SERIAL NOT NULL,
    "photo" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "alternate_mobile" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "height" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "pincode" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "playing_position" TEXT NOT NULL,
    "jersey_no" INTEGER NOT NULL,
    "about" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Players_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_mobile_key" ON "Users"("mobile");

-- AddForeignKey
ALTER TABLE "Players" ADD CONSTRAINT "Players_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

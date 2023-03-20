-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_google" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "password" DROP NOT NULL;

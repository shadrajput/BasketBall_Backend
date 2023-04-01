-- AlterTable
ALTER TABLE "match_players" ADD COLUMN     "is_captain" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tournaments" ALTER COLUMN "status" SET DEFAULT 0;

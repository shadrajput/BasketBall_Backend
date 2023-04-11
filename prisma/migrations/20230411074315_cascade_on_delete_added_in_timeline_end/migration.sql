-- DropForeignKey
ALTER TABLE "match_score" DROP CONSTRAINT "match_quarter_table";

-- AddForeignKey
ALTER TABLE "match_score" ADD CONSTRAINT "match_quarter_table" FOREIGN KEY ("quarter_id") REFERENCES "match_quarters"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

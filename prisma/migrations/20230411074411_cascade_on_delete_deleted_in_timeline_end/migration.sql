-- DropForeignKey
ALTER TABLE "match_quarters" DROP CONSTRAINT "timeline_end_score_table_id";

-- DropForeignKey
ALTER TABLE "match_score" DROP CONSTRAINT "match_quarter_table";

-- AddForeignKey
ALTER TABLE "match_quarters" ADD CONSTRAINT "timeline_end_score_table_id" FOREIGN KEY ("timeline_end_score_id") REFERENCES "match_score"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_score" ADD CONSTRAINT "match_quarter_table" FOREIGN KEY ("quarter_id") REFERENCES "match_quarters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

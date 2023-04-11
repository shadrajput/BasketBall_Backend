-- DropForeignKey
ALTER TABLE "match_quarters" DROP CONSTRAINT "timeline_end_score_table_id";

-- AddForeignKey
ALTER TABLE "match_quarters" ADD CONSTRAINT "timeline_end_score_table_id" FOREIGN KEY ("timeline_end_score_id") REFERENCES "match_score"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

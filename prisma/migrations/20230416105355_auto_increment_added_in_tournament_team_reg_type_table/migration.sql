-- CreateTable
CREATE TABLE "tournament_teams_reg_type" (
    "id" SERIAL NOT NULL,
    "tournament_team_id" INTEGER NOT NULL,
    "age_category" TEXT NOT NULL,
    "gender_type" TEXT,
    "pool_name" TEXT,
    "is_disqualified" BOOLEAN NOT NULL DEFAULT false,
    "is_knockout_upperhalf" BOOLEAN,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_teams_reg_type_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tournament_teams_reg_type" ADD CONSTRAINT "tournament_teams_reg_type" FOREIGN KEY ("tournament_team_id") REFERENCES "tournament_teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- CreateTable
CREATE TABLE "gallery" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER,
    "photo" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_player_fouls" (
    "id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "player_id" INTEGER NOT NULL,
    "total_fouls" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_player_fouls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_quarters" (
    "id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "team_1_points" INTEGER NOT NULL,
    "team_2_points" INTEGER NOT NULL,
    "team_1_fouls" INTEGER NOT NULL DEFAULT 0,
    "team_2_fouls" INTEGER NOT NULL DEFAULT 0,
    "quarter_number" INTEGER,
    "won_by_team_id" INTEGER,
    "status" INTEGER NOT NULL DEFAULT 2,
    "timeline_start_score_id" INTEGER,
    "timeline_end_score_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_quarters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_score" (
    "id" SERIAL NOT NULL,
    "team_id" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "point_status" TEXT NOT NULL,
    "quarted_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "team_1_id" INTEGER NOT NULL,
    "team_2_id" INTEGER NOT NULL,
    "quarters" INTEGER NOT NULL DEFAULT 4,
    "start_date_time" TIMESTAMP(6) NOT NULL,
    "scorekeeper_id" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "won_team_id" INTEGER,
    "status" INTEGER NOT NULL DEFAULT 1,
    "cancel_reason" TEXT,
    "round_name" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" SERIAL NOT NULL,
    "photo" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_ranking" (
    "id" SERIAL NOT NULL,
    "matches_played" INTEGER NOT NULL DEFAULT 0,
    "matches_won" INTEGER NOT NULL DEFAULT 0,
    "matches_lost" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "player_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_ranking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
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

-- CreateTable
CREATE TABLE "scorekeeper" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "token" TEXT,
    "token_expiry_time" TIMESTAMP(6),
    "is_token_expired" BOOLEAN,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scorekeeper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_players" (
    "id" SERIAL NOT NULL,
    "team_id" INTEGER NOT NULL,
    "player_id" INTEGER NOT NULL,
    "is_playing" BOOLEAN NOT NULL,
    "playing_position" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" SERIAL NOT NULL,
    "logo" TEXT,
    "team_name" TEXT NOT NULL,
    "coach_name" TEXT,
    "coach_mobile" TEXT,
    "asst_coach_name" TEXT,
    "asst_coach_mobile" TEXT,
    "about_team" TEXT,
    "matches_played" INTEGER NOT NULL DEFAULT 0,
    "matches_won" INTEGER NOT NULL DEFAULT 0,
    "matches_lost" INTEGER NOT NULL DEFAULT 0,
    "is_details_editable" BOOLEAN DEFAULT true,
    "user_id" INTEGER NOT NULL,
    "created_at" TIME(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_referees" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_referees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_sponsors" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "logo" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_sponsors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_teams" (
    "id" SERIAL NOT NULL,
    "age_categories" TEXT[],
    "is_selected" INTEGER NOT NULL DEFAULT 2,
    "reject_reason" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "is_disqualified" BOOLEAN NOT NULL DEFAULT false,
    "pool_name" TEXT,
    "gender_type" TEXT NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournaments" (
    "id" SERIAL NOT NULL,
    "logo" TEXT,
    "tournament_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "gender_types" TEXT[],
    "age_categories" TEXT[],
    "level" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "prize" TEXT,
    "is_registration_open" BOOLEAN NOT NULL DEFAULT true,
    "is_details_editable" BOOLEAN NOT NULL DEFAULT true,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_visitor" BOOLEAN NOT NULL DEFAULT true,
    "is_player" BOOLEAN NOT NULL DEFAULT false,
    "is_manager" BOOLEAN NOT NULL DEFAULT false,
    "is_organizer" BOOLEAN NOT NULL DEFAULT false,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_mobile_key" ON "users"("mobile");

-- AddForeignKey
ALTER TABLE "gallery" ADD CONSTRAINT "tournament_table" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_player_fouls" ADD CONSTRAINT "maches_table" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_player_fouls" ADD CONSTRAINT "players_table" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_quarters" ADD CONSTRAINT "match_table" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_quarters" ADD CONSTRAINT "team_table" FOREIGN KEY ("won_by_team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_quarters" ADD CONSTRAINT "timeline_end_score_table_id" FOREIGN KEY ("timeline_end_score_id") REFERENCES "match_score"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_quarters" ADD CONSTRAINT "timeline_start_score_table_id" FOREIGN KEY ("timeline_start_score_id") REFERENCES "match_score"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_score" ADD CONSTRAINT "match_quarter_table" FOREIGN KEY ("quarted_id") REFERENCES "match_quarters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_score" ADD CONSTRAINT "team_table" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "scorekeeper_table" FOREIGN KEY ("scorekeeper_id") REFERENCES "scorekeeper"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "team_1_table" FOREIGN KEY ("team_1_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "team_2_table" FOREIGN KEY ("team_2_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "tournament_table" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "won_team" FOREIGN KEY ("won_team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "player_ranking" ADD CONSTRAINT "players_table" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "Players_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_players" ADD CONSTRAINT "player_table" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "team_players" ADD CONSTRAINT "team_table" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "user_table" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournament_referees" ADD CONSTRAINT "tournament_table" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournament_sponsors" ADD CONSTRAINT "tournament_table" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournament_teams" ADD CONSTRAINT "team_table" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournament_teams" ADD CONSTRAINT "tournament_table" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "user_table" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

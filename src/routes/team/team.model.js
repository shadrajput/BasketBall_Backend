const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createTeam(teamData, logo) {
  const {
    team_name,
    about_team,
    coach_name,
    coach_mobile,
    assistant_coach_name,
    assistant_coach_mobile,
  } = teamData.TeamInfo;

  return prisma.teams.create({
    data: {
      logo,
      team_name,
      about_team,
      coach_name,
      coach_mobile,
      asst_coach_name: assistant_coach_mobile,
      asst_coach_mobile: assistant_coach_name,
      user_id: 1,
    },
  });
}

async function createTeamPlayers(playerList, teamId) {
  return Promise.all(
    playerList.map((player) =>
      prisma.team_players.create({
        data: {
          player_id: player.id,
          team_id: teamId,
          is_playing: false,
          playing_position: player.position,
        },
      })
    )
  );
}

module.exports = { createTeam, createTeamPlayers };

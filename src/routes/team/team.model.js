const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createTeam(teamData, logo, captain) {
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
      asst_coach_name: assistant_coach_name,
      asst_coach_mobile: assistant_coach_mobile,
      user_id: 1,
      captain_id: Number(captain),
    },
  });
}

async function updateTeam({ id, data, logo }) {
  const {
    team_name,
    coach_name,
    coach_mobile,
    asst_coach_name,
    asst_coach_mobile,
  } = data;

  const updatedTeam = await prisma.teams.update({
    where: { id: id },
    data: {
      logo,
      team_name,
      coach_name,
      coach_mobile,
      asst_coach_mobile,
      asst_coach_name,
    },
  });

  return updatedTeam;
}
async function getTeamDetail(team_id) {
  const team = await prisma.teams.findUnique({
    where: {
      id: Number(team_id),
    },
    include: {
      team_players: {
        include: {
          players: true,
        },
      },
      tournament_teams: {
        include: {
          tournaments: true,
        },
      },
      team_1_matches: {
        include: {
          tournaments: true,
          team_1: true,
          team_2: true,
          won_by_team: true,
          match_quarters: {
            include: {
              score: true,
            },
          },
        },
      },
      team_2_matches: {
        include: {
          tournaments: true,
          team_1: true,
          team_2: true,
          won_by_team: true,
          match_quarters: {
            include: {
              score: true,
            },
          },
        },
      },
      users: true,
    },
  });

  return team;
}

async function createTeamPlayers(playerList, teamId) {
  return Promise.all(
    playerList.map((player) =>
      prisma.team_players.create({
        data: {
          player_id: player.id,
          team_id: teamId,
          playing_position: player.playing_position,
        },
      })
    )
  );
}

module.exports = { createTeam, updateTeam, createTeamPlayers, getTeamDetail };

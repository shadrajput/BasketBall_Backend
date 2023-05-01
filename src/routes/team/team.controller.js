const {
  uploadImage,
  deleteImage,
  DefaultteamImage,
} = require("../../helper/imageUpload");
const { PrismaClient } = require("@prisma/client");
const parseFormData = require("../../helper/parseForm");
const {
  createTeam,
  createTeamPlayers,
  getTeamDetail,
  updateTeam,
  deleteTeamPlayer,
} = require("./team.model");

const prisma = new PrismaClient();

async function httpTeamRegister(req, res, next) {
  try {
    const userId = req.user.id;
    const formData = await parseFormData(req);
    const teamData = JSON.parse(formData?.fields?.data);
    const teamName = teamData.TeamInfo.team_name;
    const captain = teamData.captain;
    const existingTeam = await prisma.teams.findFirst({
      where: {
        team_name: {
          equals: teamName,
          mode: "insensitive",
        },
      },
    });

    if (existingTeam) {
      throw new Error("Please change the Team name");
    }
    let logo = "";
    logo = await uploadLogo(formData, logo);
    const team = await createTeam(teamData, logo, captain, userId);
    const teamPlayers = await createTeamPlayers(teamData.PlayerList, team.id);

    return res.status(201).json({ success: true, team, players: teamPlayers });
  } catch (err) {
    next(err);
  }
}

async function httpUpdateTeam(req, res, next) {
  try {
    const formData = await parseFormData(req);
    const teamData = JSON.parse(formData?.fields?.data);
    const captain = teamData.captain;

    let logo = teamData?.TeamInfo?.logo ? teamData?.TeamInfo?.logo : "";
    logo = await uploadLogo(formData, logo);
    const uteam = await updateTeam({
      id: teamData?.TeamInfo?.id,
      data: teamData?.TeamInfo,
      logo: logo,
      captain: captain,
    });

    const deletedPlayer = await deleteTeamPlayer(uteam?.id);

    const teamPlayers = await createTeamPlayers(teamData.PlayerList, uteam.id);

    return res
      .status(200)
      .json({ success: true, team: uteam, players: teamPlayers });
  } catch (error) {
    next(error);
  }
}

async function httpGetAllTeams(req, res, next) {
  let { page, TeamName } = req.params;
  TeamName = TeamName == "search" ? "" : TeamName;
  const itemsPerPage = 10

  try {
    const teams = await prisma.teams.findMany({
      orderBy: { matches_won: "desc" },
      skip: page * itemsPerPage,
      take: itemsPerPage,
      where: {
        team_name: {
          contains: TeamName == "" ? "" : TeamName,
          mode: "insensitive",
        },
      },
      include: {
        team_players: true,
        users: true,
      },
    });

    const totalTeams = await prisma.teams.count({})

    return res.status(200).json({
      success: true,
      pageCount: Math.ceil(totalTeams / itemsPerPage), 
      data: teams
    });
  } catch (error) {
    next(error);
  }
}

async function httpPostTournament(req, res) {
  const data = req.body;

  try {
    const existingRecord = await prisma.tournament_teams.findFirst({
      where: {
        tournament_id: { equals: data.tournament_id },
        AND: {
          team_id: { equals: data.team_id },
        },
      },
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: "This team is already registered for this tournament.",
      });
    }
    const result = await prisma.tournament_teams.create({
      data: {
        age_categories: data.age_cutoff,
        gender_type: data.tournament_category,
        tournament_id: data.tournament_id,
        team_id: data.team_id,
      },
    });
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function httpGetTeamByUserId(req, res, next) {
  const userId = req.user.id;

  try {
    const teams = await prisma.teams.findMany({
      where: {
        user_id: Number(userId),
      },
      include: {
        team_players: true,
      },
    });

    return res.status(200).json({ success: true, data: teams });
  } catch (error) {
    next(error);
  }
}

async function uploadLogo(formData, logo) {
  const { files } = formData;
  if (!files || !files.team_logo) {
    return logo.length <= 2 ? DefaultteamImage : logo;
  }

  try {
    if (logo && logo != DefaultteamImage) {
      await deleteImage(logo);
    }
    return await uploadImage(files.team_logo, "team_images");
  } catch (error) {
    throw new Error(error.message);
  }
}

async function httpGetTeamDetailById(req, res, next) {
  const team_id = req.params?.id;
  try {
    const team = await getTeamDetail(team_id);

    if (!team) {
      return res.status(400).json({ success: true, message: "Team Not found" });
    }

    return res.status(200).json({ success: true, data: team });
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = {
  httpTeamRegister,
  httpGetTeamDetailById,
  httpGetTeamByUserId,
  httpUpdateTeam,
  httpPostTournament,
  httpGetAllTeams,
};

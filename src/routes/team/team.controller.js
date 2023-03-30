const { uploadImage, deleteImage } = require("../../helper/imageUpload");
const { PrismaClient } = require("@prisma/client");
const parseFormData = require("../../helper/parseForm");
const { createTeam, createTeamPlayers } = require("./team.model");

const prisma = new PrismaClient();

async function httpTeamRegister(req, res, next) {
  try {
    const formData = await parseFormData(req);
    const teamData = JSON.parse(formData?.fields?.data);
    const teamName = teamData.TeamInfo.team_name;
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

    const logo = await uploadLogo(formData);
    const team = await createTeam(teamData, logo);
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
    let logo = "";
    if (teamData.oldImage != teamData.logo) {
      await deleteImage(teamData?.oldImage);
    } else {
      logo = await uploadLogo(formData);
    }
  } catch (error) {
    next(error);
  }
}

async function httpGetAllTeams(req, res, next) {
  console.log(req.params);
  let { page, TeamName } = req.params;
  TeamName = TeamName == "search" ? "" : TeamName;
  try {
    const teams = await prisma.teams.findMany({
      orderBy: { matches_won: "desc" },
      skip: page * 5,
      take: 5,
      where: {
        team_name: {
          contains: TeamName == "" ? "" : TeamName,
          mode: "insensitive",
        },
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

async function httpSearchTeamByName(req, res, next) {
  const query = req.body?.query;
  if (!query) {
    return res
      .status(400)
      .json({ success: false, message: "Please Enter Team name" });
  }
  try {
    const teams = await prisma.teams.findMany({
      where: {
        team_name: {
          contains: query,
          mode: "insensitive",
        },
      },
    });

    return res.status(200).json({ success: true, data: teams });
  } catch (error) {
    next(error);
  }
}

async function uploadLogo(formData) {
  const { files } = formData;
  if (!files || !files.team_logo) {
    return "";
  }

  try {
    return await uploadImage(files.team_logo, "team_images");
  } catch (error) {
    throw new Error(error.message);
  }
}

async function httpGetTeamDetailById(req, res, next) {
  const team_id = req.params?.id;
  console.log(team_id);
  try {
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
        tournament_teams: true,
        users: true,
      },
    });

    if (!team) {
      return res.status(400).json({ success: true, message: "Team Not found" });
    }

    return res.status(200).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  httpTeamRegister,
  httpGetTeamDetailById,
  httpSearchTeamByName,
  httpGetAllTeams,
};

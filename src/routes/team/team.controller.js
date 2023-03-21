const { uploadImage } = require("../../helper/imageUpload");
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

async function httpGetAllTeams(req, res, next) {}

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

module.exports = { httpTeamRegister, httpGetAllTeams };

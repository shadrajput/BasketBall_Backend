const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");
const { PrismaClient } = require("@prisma/client");
const ErrorHandler = require("../../utils/ErrorHandler");
const generateToken = require("../../utils/tokenGenerator");

const prisma = new PrismaClient();

async function getMatchList(req, res) {
  const { pageNo, status } = req.params;

  const matchesList = await prisma.matches.findMany({
    where: {
      status: Number(status),
    },
    skip: pageNo * 5,
    take: 5,
  });

  console.log(matchesList);
  res.status(201).json({ success: true, data: matchesList });
}

const matchScore = catchAsyncErrors(async (req, res, next) => {
  const match_id = Number(req.params.match_id);

  const match_details = await prisma.matches.findUnique({
    where: {
      id: match_id,
    },
    include: {
      tournaments: true,
      team_1: true,
      team_2: true,
      scorekeeper: true,
      won_by_team: true,
    },
  });

  const team_1_players = await prisma.match_players.findMany({
    where: {
      match_id,
      team_id: match_details.team_1_id,
    },
    include: {
      players: true,
    },
  });

  const team_2_players = await prisma.match_players.findMany({
    where: {
      match_id,
      team_id: match_details.team_2_id,
    },
    include: {
      players: true,
    },
  });

  const all_quarters = await prisma.match_quarters.findMany({
    where: {
      match_id,
    },
    include: {
      score: true,
    },
  });

  //   const live_quarter = await prisma.match_quarters.findFirst({
  //     where: {
  //       status: 2,
  //     },
  //     include: {
  //       score: true,
  //     },
  //   });

  res.status(200).json({
    success: true,
    match_details,
    all_quarters,
    team_1_players,
    team_2_players,
  });
});

const updateMatchDetails = catchAsyncErrors(async (req, res, next) => {
  const match_id = Number(req.params.match_id);
  const {
    start_date,
    start_time,
    address,
    scorekeeper_name,
    scorekeeper_email,
    scorekeeper_mobile,
  } = req.body;

  const token = generateToken(32);

  const scorekeeper_details = await prisma.scorekeeper.create({
    data: {
      name: scorekeeper_name,
      email: scorekeeper_email,
      mobile: scorekeeper_mobile,
      token,
    },
  });

  await prisma.matches.update({
    where: {
      id: match_id,
    },
    data: {
      start_date: new Date(start_date),
      start_time,
      address,
      scorekeeper_id: scorekeeper_details.id,
    },
  });

  res
    .status(200)
    .json({ success: true, message: "Match details updated successfully" });
});

const viralTheMatch = catchAsyncErrors(async (req, res, next) => {
  const match_id = Number(req.params.match_id);
  await prisma.matches.update({
    where: {
      id: match_id,
    },
    data: {
      status: 1,
    },
  });

  res
    .status(200)
    .json({ success: true, message: "Public will see this match as upcoming" });
});

module.exports = {
  matchScore,
  updateMatchDetails,
  viralTheMatch,
  getMatchList,
};

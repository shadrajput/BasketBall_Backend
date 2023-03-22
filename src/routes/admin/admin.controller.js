const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");
const { PrismaClient } = require("@prisma/client");
const ErrorHandler = require("../../utils/ErrorHandler");
const ImageKit = require("imagekit");
const formidable = require("formidable");
const fs = require("fs");

const prisma = new PrismaClient();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const getTournamentRequest = catchAsyncErrors(async (req, res, next) => {
  const tournaments = await prisma.tournaments.findMany({
    where: {
      is_approved: false,
      status: 0,
    },
  });

  if (tournaments.length == 0) {
    return next(new ErrorHandler("No tournament requests found"));
  }

  res.status(200).json({ success: true, tournaments });
});

const approveTournamentRequest = catchAsyncErrors(async (req, res, next) => {
  const tournament_id = Number(req.params.tournament_id);
  await prisma.tournaments.findMany({
    where: {
      id: tournament_id,
      is_approved: true,
      status: 1,
    },
  });

  res
    .status(200)
    .json({ success: true, message: "Tournament approved successfully" });
});

const cancelTournamentRequest = catchAsyncErrors(async (req, res, next) => {
  const tournament_id = Number(req.params.tournament_id);

  await prisma.tournaments.update({
    where: {
      id: tournament_id,
    },
    data: {
      status: -1,
    },
  });

  res
    .status(200)
    .json({ success: true, message: "Tournament cancelled successfully" });
});

module.exports = {
  getTournamentRequest,
  approveTournamentRequest,
  cancelTournamentRequest,
};

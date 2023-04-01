const { config } = require("dotenv");
const jwt = require("jsonwebtoken");
const catchAsyncErrors = require("./catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const JWTSign = process.env.JWT_SIGN;

//Generate auth token
exports.generateToken = (userID) => {
  const token = jwt.sign(userID, JWTSign);
  if (!token) {
    return new ErrorHandler("Failed to generate token", 500);
  }

  return token;
};

//Compare password
exports.comparePassword = async function (enteredPassword, dbPassword) {
  const result = await bcrypt.compare(enteredPassword, dbPassword);
  return result;
};

//Authenticate user
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  // const token = req.headers.token;

  // if (!token) {
  //   return next(new ErrorHandler("Please login to access this resource", 401));
  // }

  // const user_id = jwt.verify(token, JWTSign);

  // req.user = await prisma.users.findUnique({
  //   where: { id: user_id },
  // });

  next();
});

//Authenticate Admin
exports.isAuthenticatedAdmin = catchAsyncErrors(async (req, res, next) => {
  const admin = await prisma.users.findFirst({
    where: { id: req.user.id, is_admin: true },
  });

  if (!admin) {
    return next(new ErrorHandler("Only admin can access this resouce", 401));
  }

  next();
});

//Authenticate scorekeeper
exports.verifyScorekeeper = catchAsyncErrors(async (req, res, next) => {
  const scorekeeper_id = Number(req.params.id);
  const match_id = Number(req.params.match_id);
  const token = Number(req.params.token);

  if (token == null) {
    return next(new ErrorHandler("Link expired", 400));
  }

  const scorekeeper_details = await prisma.scorekeeper.findFirst({
    where: {
      id: scorekeeper_id,
      token,
    },
  });

  if (!scorekeeper_details) {
    return next(
      new ErrorHandler("You are not authorized to access this page", 400)
    );
  }

  const match_detail = await prisma.matches.findFirst({
    where: {
      scorekeeper_id: scorekeeper_details.id,
    },
  });

  if (!match_detail || match_detail.id != match_id) {
    return next(
      new ErrorHandler("You are not authorized to access this page", 400)
    );
  }

  if (match_detail.status == 3 || match_detail.status == -1) {
    return next(new ErrorHandler("Your link has expired", 400));
  }

  next();
});

//Authentication for team manager
exports.isAuthTeamManager = catchAsyncErrors(async (req, res, next) => {
  if (!req.user.is_manager) {
    return next(new ErrorHandler("Unauthorized access", 401));
  }

  const user_team = await prisma.teams.findFirst({
    where: {
      id: req.params.team_id,
      user_id: req.user.id,
    },
  });

  if (!user_team) {
    return next(new ErrorHandler("Unauthorized access", 401));
  }

  next()
});

//Authentication for tournament organizer
exports.isAuthTournamentOrganizer = catchAsyncErrors(async (req, res, next) => {
  // if (!req.user.is_organizer) {
  //   return next(new ErrorHandler("Unauthorized access", 401));
  // }

  // const user_tournament = await prisma.tournaments.findFirst({
  //   where: {
  //     id: req.params.tournament_id,
  //     user_id: req.user.id,
  //   },
  // });

  // if (!user_tournament) {
  //   return next(new ErrorHandler("Unauthorized access", 401));
  // }

  next();
});

//Authentication for player
exports.isAuthPlayer = catchAsyncErrors(async (req, res, next) => {
  if (!req.user.is_player) {
    return next(new ErrorHandler("Unauthorized access", 401));
  }

  const player = await prisma.players.findFirst({
    where: {
      id: req.params.player_id,
      user_id: req.user.id,
    },
  });

  if (!player) {
    return next(new ErrorHandler("Unauthorized access", 401));
  }

  next();
});

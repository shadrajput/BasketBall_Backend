const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");
const { PrismaClient } = require("@prisma/client");
const ErrorHandler = require("../../utils/ErrorHandler");
const ImageKit = require("imagekit");
const formidable = require("formidable");
const fs = require("fs");
const deleteTournamentFunc = require("../../helper/deleteTournamentFunc")

const prisma = new PrismaClient();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const getAdminDashboardData = catchAsyncErrors(async (req, res, next) => {
  const total_users = await prisma.users.count()
  const ongoing_tournaments = await prisma.tournaments.count({
    where:{
      status: 2
    }
  })

  const total_teams = await prisma.teams.count()
  const total_players = await prisma.players.count()

  res.status(200).json({ success: true, total_users, ongoing_tournaments, total_teams, total_players });
});

const getTournamentRequest = catchAsyncErrors(async (req, res, next) => {
  const tournaments = await prisma.tournaments.findMany({
    where: {
      is_approved: false,
      status: 0,
    },
  });

  res.status(200).json({ success: true, tournaments });
});

const approveTournamentRequest = catchAsyncErrors(async (req, res, next) => {
  const tournament_id = Number(req.params.tournament_id);
  await prisma.tournaments.update({
    where: {
      id: tournament_id,
    },
    data:{
      is_approved: true,
      status: 1
    }
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

const deleteTournament = catchAsyncErrors(async (req, res, next) => {
  const tournament_id = Number(req.params.tournament_id)

  //checking if matches were created or not
  const matches = await prisma.matches.findFirst({ 
    where:{
      tournament_id
    }
  })

  if(matches){
    return next(new ErrorHandler("Can't delete tournament", 400));
  }

  
  await deleteTournamentFunc(tournament_id)

  res.status(200).json({ success: true, message: 'Tournament deleted successfully' });
});

const deleteTeam = catchAsyncErrors(async (req, res, next) => {
  const team_id = Number(req.params.team_id);

  //checking if the team has participated in any tournament or not
  const tournament_team_details = await prisma.tournament_teams.findFirst({
    where: {
      team_id,
      is_selected: true,
    },
  });

  if (tournament_team_details) {
    return next(
      new ErrorHandler("Can't delete the team participated in tournament")
    );
  }

  //deleting the teams players
  await prisma.team_players.deleteMany({
    where: {
      team_id,
    },
  });

  //deleting the team
  const team = await prisma.teams.delete({
    where: {
      id: team_id,
    },
  });

  const user_teams = await prisma.teams.findMany({
    where: {
      user_id: team.user_id,
    }
  })

  if(user_teams.length == 0){
    await prisma.users.update({
      where:{
        id: team.user_id
      },
      data:{
        is_manager: false
      }
    })
  }

  res.status(200).json({ success: true, message: "Team deleted successfully" });
});

const deletePlayer = catchAsyncErrors(async (req, res, next) => {
  const player_id = Number(req.params.player_id);

  //checking if the player has player any match
  const player_stats = await prisma.player_statistics.findFirst({
    where: {
      player_id,
      matches_player: {
        gt: 0,
      },
    },
  });

  if (player_stats) {
    return next(new ErrorHandler("Can't delete player who played a match"));
  }

  //Deleting the player stats
  await prisma.player_statistics.delete({
    where: {
      player_id,
    },
  });

  //deleting from the team
  await prisma.team_players.deleteMany({
    where: {
      player_id,
    },
  });

  //deleting the player details
  const player = await prisma.players.delete({
    where: {
      id: player_id,
    },
  });

  await prisma.users.update({
    where: {
      id: player.user_id,
    },
    data: {
      is_player: false,
    },
  });

  res
    .status(200)
    .json({ success: true, message: "Player deleted successfully" });
});

module.exports = {
  getTournamentRequest,
  getAdminDashboardData,
  approveTournamentRequest,
  cancelTournamentRequest,
  deleteTournament,
  deleteTeam,
  deletePlayer,
};

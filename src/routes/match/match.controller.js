const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");
const { PrismaClient } = require("@prisma/client");
const ErrorHandler = require("../../utils/ErrorHandler");
const generateToken = require("../../utils/tokenGenerator");

const prisma = new PrismaClient();

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
    orderBy:{
      players:{
        first_name: 'asc'
      }
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
    orderBy:{
      players:{
        first_name: 'asc'
      }
    },
    include: {
      players: true,
    },
  });

  const all_quarters = await prisma.match_quarters.findMany({
    where: {
      match_id,
    },
    orderBy:{
      created_at: 'asc'
    },
    include: {
      score: true,
    },
  });

  const live_quarter = all_quarters.find((quarter)=>{
    return quarter.status == 2 //running
  })

  let team_1_total_points = 0, team_2_total_points = 0, team_1_total_won = 0, team_2_total_won = 0

  for(let i=0; i<all_quarters.length; i++){
    team_1_total_points += all_quarters[i].team_1_points
    team_2_total_points += all_quarters[i].team_2_points

    if(all_quarters[i].won_by_team_id != null){
      if(all_quarters[i].won_by_team_id == match_details.team_1_id){
        team_1_total_won += 1
      }
      else{
        team_2_total_won += 1
      }

    }
  }

  res.status(200).json({
    success: true,
    match_data:{
      data: match_details,
      all_quarters,
      live_quarter,
      team_1_total_points,
      team_2_total_points,
      team_1_total_won,
      team_2_total_won,
      team_1_players,
      team_2_players,
    }
  });
});

const matchList = catchAsyncErrors(async(req,res,next) => {
  try {
    const matches = await prisma.matches.findMany({
      include:{
        team_1  : true,
        team_2  : true,
        tournaments : true
      }
    });

    res.status(200).json({
      data: matches,
      success: true,
      message: "LiveMatch",
    });
  } catch (error) {
    next(error)
  }
})

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

  // const scorekeeper_details = await prisma.scorekeeper.create({
  //   data: {
  //     name: scorekeeper_name,
  //     email: scorekeeper_email,
  //     mobile: scorekeeper_mobile,
  //     token,
  //   },
  // });

  await prisma.matches.update({
    where: {
      id: match_id,
    },
    data: {
      start_date: new Date(start_date),
      start_time,
      address,
      // scorekeeper_id: scorekeeper_details.id
    },
  });

  res
    .status(200)
    .json({ success: true, message: "Match details updated successfully" });
});

const deleteMatch = catchAsyncErrors(async(req, res, next)=>{
  console.log("ok ")
  const match_id = Number(req.params.match_id);

  const quarters = await prisma.match_quarters.findFirst({
    where:{
      match_id
    }
  })


  if(quarters){
    return next(new ErrorHandler("Can't delete match"))
  }

  //Deleting all match players
  await prisma.match_players.deleteMany({
    where:{
      match_id
    }
  })

  const match_details = await prisma.matches.findUnique({
    where:{
      id: match_id
    }
  })

  //Deleting match
  await prisma.matches.delete({
    where: {
      id: match_id
    }
  })
  

  //Deleting scorekeeper
  if(match_details.scorekeeper_id){
    await prisma.scorekeeper.delete({
      where:{
        id: match_details.scorekeeper_id
      }
    })
  }

  res
    .status(200)
    .json({ success: true, message: "Match deleted successfully" });
})


module.exports = {
  matchScore,
  matchList,
  updateMatchDetails,
  deleteMatch
};

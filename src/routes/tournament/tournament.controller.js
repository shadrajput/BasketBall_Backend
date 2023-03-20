const catchAsyncErrors = require("../../middlewares/catchAsyncErrors")
const { PrismaClient } = require('@prisma/client');
const ErrorHandler = require("../../utils/ErrorHandler");
const ImageKit = require("imagekit");
const formidable = require("formidable");
const fs = require("fs");


const prisma = new PrismaClient();

const imagekit = new ImageKit({
    publicKey : process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint : process.env.IMAGEKIT_URL_ENDPOINT 
});

const tournamentRegistration = catchAsyncErrors(async(req, res, next) => {

    const form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      const result = await prisma.tournaments.findFirst({ 
          where: {
              AND:[
                  {
                      tournament_name :{
                          equals: fields.tournament_name,
                          mode: 'insensitive'
                      }
                  },
                  { 
                      //can't create the tournament with the same name until the tournament is upcoming/live
                      status: {
                          in: [1, 2]
                      }
                  }
              ]
          }
      })

      if(result){
          return next(new ErrorHandler('Please change the tournament name'))
      }

      let logo = "";
      const myPromise = new Promise(async(resolve, reject) => {
        if (files.logo.originalFilename != "" && files.logo.size != 0) {
          const ext = files.logo.mimetype.split("/")[1].trim();

          if (files.logo.size >= 2000000) {
            // 2000000(bytes) = 2MB
            return next(new ErrorHandler('Photo size should be less than 2MB', 400));
          }
          if (ext != "png" && ext != "jpg" && ext != "jpeg") {
            return next(new ErrorHandler("Only JPG, JPEG or PNG logo is allowed", 400));
          }

          var oldPath = files.logo.filepath;
          var fileName = Date.now() + "_" + files.logo.originalFilename;

          fs.readFile( oldPath, function (err, data) {
            if (err) {
                return next(new ErrorHandler(err.message, 500));
            }
            imagekit.upload({
              file : data,
              fileName : fileName, 
              overwriteFile: true,
              folder: '/tournament_images'
            }, function(error, result) {
              if(error) {
                return next(new ErrorHandler(error.message, 500));
              }
              logo = result.url
              resolve();
            });
          });
        }
        else{
          resolve()
        }
      })

      myPromise.then(async ()=> {

        let {user_id = 1, tournament_name, address, start_date, end_date, gender_types, age_categories, level, prize} = fields

        start_date = new Date(start_date)
        end_date = new Date(end_date)
        gender_types = JSON.parse(gender_types)
        age_categories = JSON.parse(age_categories)

        await prisma.tournaments.create({
            data:{
                user_id: Number(user_id),
                logo,
                tournament_name,
                address,
                start_date, //date should be in YYYY-mm-dd format
                end_date,
                gender_types,
                age_categories,
                level, 
                prize
            }
        })

        res.status(201).json({success: true, message: "Registration successfull. Soon Admin will verify your tournament."})
      })

    });

})

const allTournaments = catchAsyncErrors(async(req, res, next)=>{
  const all_tournaments = await prisma.tournaments.findMany({
    where:{
      is_approved: false,
    },
    include:{
      users: true
    }
  });

  res.status(200).json({success: true, all_tournaments});
})

const updateTournamentDetails = catchAsyncErrors(async(req, res, next) => {

  const form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      let logo = "";
      const myPromise = new Promise(async(resolve, reject) => {

        //Searching and deleting old photo from imagekit
        if (
          fields.old_logo_url != fields.logo_name
        ) {
          //Searching old photo
          const old_logo_name = fields.old_logo_url.split('/')[5];
          let old_logo_fileId = '';

            imagekit.listFiles({
              searchQuery : `'name'="${old_logo_name}"`
            }, function(error, result) {
                if(error){
                  return next(new ErrorHandler("Failed to update logo", 500));
                } 
                if(result && result.length > 0) {
                  old_logo_fileId = result[0].fileId

                  //Deleting old photo
                  imagekit.deleteFile(old_logo_fileId, function(error, result) {
                    if(error){
                      return next(new ErrorHandler("Failed to update logo", 500));
                    }
                  });
                }
            });
        }

        if (files.logo.originalFilename != "" && files.logo.size != 0) {
          const ext = files.logo.mimetype.split("/")[1].trim();

          if (files.logo.size >= 2000000) {
            // 2000000(bytes) = 2MB
            return next(new ErrorHandler('Photo size should be less than 2MB', 400));
          }
          if (ext != "png" && ext != "jpg" && ext != "jpeg") {
            return next(new ErrorHandler("Only JPG, JPEG or PNG logo is allowed", 400));
          }

          var oldPath = files.logo.filepath;
          var fileName = Date.now() + "_" + files.logo.originalFilename;

          fs.readFile( oldPath, function (err, data) {
            if (err) {
                return next(new ErrorHandler(err.message, 500));
            }
            imagekit.upload({
              file : data,
              fileName : fileName, 
              overwriteFile: true,
              folder: '/tournament_images'
            }, function(error, result) {
              if(error) {
                return next(new ErrorHandler(error.message, 500));
              }
              logo = result.url
              resolve();
            });
          });
        }
        else{
          resolve()
        }
      })

      myPromise.then(async ()=> {
        const {tournament_id} = req.params
    
        const {tournament_name, address, start_date, end_date, gender_types, age_categories, level, prize} = fields

        await prisma.tournaments.update({
            where:{
                id: Number(tournament_id)
            },
            data:{  
                tournament_name,
                address,
                start_date: new Date(start_date), //date should be in YYYY-mm-dd format
                end_date: new Date(end_date),
                gender_types,
                age_categories,
                level, 
                prize
            }
        })

        res.status(200).json({success: true, message: "Tournament details updated"})

      })
    });
})

const tournamentDetails = catchAsyncErrors(async(req, res, next) => {
  const {tournament_id} = req.params;

  const tournamentDetails = await prisma.tournaments.findUnique({
    where: {id: Number(tournament_id)},
    include: {
      tournament_sponsors: true,
      tournament_referees: true,
      tournament_teams: true,
      matches: true,
      gallery: true,
      users: true
    },
  })

  if(!tournamentDetails){
    return next(new ErrorHandler('Tournament not found', 404));
  }
  
  res.status(200).json({success: true, tournamentDetails})
})

const startRegistration = catchAsyncErrors(async(req, res, next) => {
  const {tournament_id} = req.params;

  await prisma.tournaments.update({
    where:{
      id: Number(tournament_id),
    },
    data:{
      is_registration_open: true
    }
  })

  res.status(200).json({success: true, message: "Registration started successfully"})
})

const closeRegistration = catchAsyncErrors(async(req, res, next) => {
  const {tournament_id} = req.params;

  await prisma.tournaments.update({
    where:{
      id: Number(tournament_id),
    },
    data:{
      is_registration_open: false
    }
  })

  res.status(200).json({success: true, message: "Registration closed successfully"})
})

const startTournament = catchAsyncErrors(async(req, res, next)=>{
  const {tournament_id} = req.params;
  await prisma.tournaments.update({
    where:{
      id: Number(tournament_id),
    },
    data: {
      status: 2, //2 == live
      is_details_editable: false
    }
  })

  res.status(200).json({success: true, message: "Tournament started successfully"})
})

const endTournament = catchAsyncErrors(async(req, res, next) => {
  const {tournament_id} = req.params;

  await prisma.tournaments.update({
    where:{
      id: Number(tournament_id),
    },
    data:{
      status: 3, //3 == completed
      is_details_editable: false
    }
  })

  res.status(200).json({success: true, message: "Tournament ended successfully"})

})

const disqualifyTeam = catchAsyncErrors(async(req, res, next) => {
  const {tournament_id, team_id} = req.params;

  const tournament_teams_id = await prisma.tournament_teams.findFirst({
    where:{
      AND:[
        {tournament_id: Number(tournament_id)},
        {team_id: Number(team_id)},
        {is_selected: true}
      ]
    }
  })

  await prisma.tournament_teams.update({
    where:{
      id: tournament_teams_id,
    },
    data:{
      status: 3, //3 == completed
      is_details_editable: false
    }
  })

  res.status(200).json({success: true, message: "Team disqualified successfully"})
})

const createPools = catchAsyncErrors(async(req, res, next) => {
  const tournament_id = Number(req.params.tournament_id);
  const total_groups = req.body.total_groups
  const teams_per_group = req.body.teams_per_group
  const total_bye_teams = req.body.total_bye_teams

  const pool_names = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'P', 'Q']

  if(total_bye_teams == 0){
    const all_teams = await prisma.tournament_teams.findMany({
      where: { 
        tournament_id,
        is_disqualified: false,
        is_selected: true
      }
    })

    //shuffling the teams in an array
    for(let i=0; i<10; ) {
      const random_no_1 = Match.floor((Math.random() * 10))
      const random_no_2 = Match.floor((Math.random() * 10))

      if(random_no_1 != random_no_2) {
        i++
        let temp = all_teams[random_no_1];
        all_teams[random_no_1] = all_teams[random_no_2]
        all_teams[random_no_2] = temp
      }
    }

    //Giving pool names to the teams
    let j=0, count=1
    for(let i=0; i<all_teams.length; i++){
      await prisma.tournament_teams.update({
        where:{
          id: all_teams[i].id,
        },
        data:{
          pool_name: pool_names[j]
        }
      })

      if(count == teams_per_group){
        count = 1;
        j++;
      }
    }
  }
})

const matchFormation = catchAsyncErrors(async(req, res, next)=>{
  const tournament_id = Number(req.params.tournament_id);
  const round_name = req.body.round_name;
  const formation_method = req.body.formation_method
  const is_formation_by_group = req.body.is_formation_by_group
  const gender_type = req.body.gender_type
  const age_type = req.body.age_type

  const tournament_details = await prisma.tournaments.findUnique({ where:{id: tournament_id}})

  if(is_formation_by_group){
    const pools = await prisma.tournament_teams.groupBy({
      by:['pool_name'],
      where:{
        tournament_id,
        is_selected: true,
        is_disqualified: false
      }
    }) //How to access: pools[0].pool_name

    //ROUND ROBIN formation
    if(formation_method == 'league'){

      for(let i=0; i<pools.length; i++) {
        const teams = await prisma.tournament_teams.findMany({
          where:{
            tournament_id,
            is_seleted: true,
            is_disqualified: false,
            pool_name: pools[i].pool_name,
            age_categories: {
              hasEvery: [age_type],
            },
            gender_type: {
              hasEvery: [gender_type],
            },
          }
        })
        
        let j=0, k=0;
        while(j < teams.length){
          k = j+1
          while(k < teams.length){
            k++
            await prisma.matches.create({
              tournament_id,
              team_1_id: teams[j].team_id,
              team_2_id: teams[k].team_id,
              address: tournament_details.address,
              round_name
            })
          }
          j++
        }
      }
      
    }
    else{ //KNOCKOUT formation

      //checking if previously divided into upper half and lower half or not
      const result_teams = await prisma.tournament_teams.findMany({
        where:{
          tournament_id,
          is_seleted: true,
          is_disqualified: false,
          NOT:[
            {is_knockout_upperhalf: null},
          ],
          age_categories: {
            hasEvery: [age_type],
          },
          gender_type: {
            hasEvery: [gender_type],
          },
        }
      })

      if(result_teams.length > 0){

        const upperhalf_teams = getKnockoutUpperLowerHalfTeams (tournament_id, age_type, gender_type, true)

        const lowerhalf_teams = getKnockoutUpperLowerHalfTeams (tournament_id, age_type, gender_type, false)

        if(upperhalf_teams.length == 1 && lowerhalf_teams.length == 1){ //Final round
           await prisma.matches.create({
              tournament_id,
              team_1_id: upperhalf_teams[0].team_id,
              team_2_id: lowerhalf_teams[0].team_id,
              address: tournament_details.address,
              round_name
            })
        }
        else{
          //upperhalf match formation
          for(let i=0; i+1 < upperhalf_teams.length; i+=2) {
            await prisma.matches.create({
              tournament_id,
              team_1_id: upperhalf_teams[i].team_id,
              team_2_id: upperhalf_teams[i+1].team_id,
              address: tournament_details.address,
              round_name
            })
          }
  
          //lowerhalf match formation
          for(let i=0; i+1 < lowerhalf_teams.length; i+=2) {
            await prisma.matches.create({
              tournament_id,
              team_1_id: lowerhalf_teams[i].team_id,
              team_2_id: lowerhalf_teams[i+1].team_id,
              address: tournament_details.address,
              round_name
            })
          }
        }
      }
      else{
        const teams = await prisma.tournament_teams.findMany({
          where:{
            tournament_id,
            is_seleted: true,
            is_disqualified: false,
            age_categories: {
              hasEvery: [age_type],
            },
            gender_type: {
              hasEvery: [gender_type],
            },
          }
        })
  
        let total_byes = 0, i = 1;
        while(1){
          if(teams.length < Math.pow(2,i)){
            total_byes = Math.pow(2,i) - teams.length;
            break;
          }
          i++
        }
  
        let upper_half_bye_teams = total_byes%2 != 0 ? (total_byes-1)/2 : total_byes/2
        let lower_half_bye_teams = total_byes%2 != 0 ? (total_byes+1)/2 : total_byes/2
        let upper_half_total_teams = teams.length%2 != 0 ? (teams.length+1)/2 : teams.length/2
        let lower_half_total_teams = teams.length%2 != 0 ? (teams.length-1)/2 : teams.length/2
  
        //updating upperhalf
        for(let i=0; i<upper_half_total_teams; i++){
          await prisma.tournament_teams.update({
            where:{
              id: teams[i].id
            },
            data:{
              is_knockout_upperhalf: true
            }
          })
        }

        //updating lowerhalf
        for(let i=0; i<lower_half_total_teams; i++){
          await prisma.tournament_teams.update({
            where:{
              id: teams[i].id
            },
            data:{
              is_knockout_upperhalf: false
            }
          })
        }

        const upperhalf_teams = getKnockoutUpperLowerHalfTeams (tournament_id, age_type, gender_type, true)

        const lowerhalf_teams = getKnockoutUpperLowerHalfTeams (tournament_id, age_type, gender_type, false)

        //upper half teams (not bye) match formation
        for(let i=0; i+1 < (upper_half_total_teams-upper_half_bye_teams); i+=2) {
          await prisma.matches.create({
            tournament_id,
            team_1_id: upperhalf_teams[i].team_id,
            team_2_id: upperhalf_teams[i+1].team_id,
            address: tournament_details.address,
            round_name
          })
        }

        //lower half teams (not bye) match formation
        for(let i=0; i+1 < (lower_half_total_teams-lower_half_bye_teams); i+=2) {
          await prisma.matches.create({
            tournament_id,
            team_1_id: lowerhalf_teams[i].team_id,
            team_2_id: lowerhalf_teams[i+1].team_id,
            address: tournament_details.address,
            round_name
          })
        }
      }
      
    }

    res.status(201).json({ success: true, message: 'Matches formed successfully'});
  }

})

async function getKnockoutUpperLowerHalfTeams (tournament_id, age_type, gender_type, is_knockout_upperhalf){
  return await prisma.tournament_teams.findMany({
    where:{
      tournament_id,
      is_seleted: true,
      is_disqualified: false,
      is_knockout_upperhalf,
      age_categories: {
        hasEvery: [age_type],
      },
      gender_type: {
        hasEvery: [gender_type],
      },
    }
  })
}

module.exports ={
    tournamentRegistration,
    allTournaments,
    updateTournamentDetails,
    tournamentDetails,
    startRegistration,
    closeRegistration,
    startTournament,
    endTournament,
    disqualifyTeam,
    createPools,
    matchFormation
}
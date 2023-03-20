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
        {team_id: Number(team_id)}
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

const uploadGalleryImage = catchAsyncErrors((req, res, next)=>{
  
})

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
    uploadGalleryImage
}
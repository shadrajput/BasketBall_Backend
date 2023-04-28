const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");
const { PrismaClient } = require("@prisma/client");
const ErrorHandler = require("../../utils/ErrorHandler");
const ImageKit = require("imagekit");
const formidable = require("formidable");
const fs = require("fs");
const { uploadImage, deleteImage, tournamentDefaultImage } = require("../../helper/imageUpload");
const deleteTournamentFunc = require("../../helper/deleteTournamentFunc")

const prisma = new PrismaClient();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const tournamentRegistration = catchAsyncErrors(async (req, res, next) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    
    fields.referees = JSON.parse(fields.referees)
    fields.sponsors = JSON.parse(fields.sponsors)

    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    const result = await prisma.tournaments.findFirst({
      where: {
        AND: [
          {
            tournament_name: {
              equals: fields.tournament_name,
              mode: "insensitive",
            },
          },
          {
            //can't create the tournament with the same name until the tournament is upcoming/live
            status: {
              in: [1, 2],
            },
          },
        ],
      },
    });

    if (result) {
      return next(new ErrorHandler("Please change the tournament name", 400));
    }

    let logo = "";
    const myPromise = new Promise(async (resolve, reject) => {

      if (files.logo && files.logo.originalFilename != "" && files.logo.size != 0) {
        const imageUrl = await uploadImage(files.logo, "tournament_images") 
        logo = imageUrl;
      }

      if(fields.sponsors.length > 0 && files.sponsors_logo0) {
        for(let i = 0; i < fields.sponsors.length; i++){
          const imageUrl = await uploadImage(files[`sponsors_logo${i}`], "tournament_sponsors") 
          fields.sponsors[i].logo = imageUrl;
        }
      }
        
      resolve();
      
    });

    myPromise.then(async () => {
      let {
        tournament_name,
        address,
        start_date,
        end_date,
        gender_types,
        age_categories,
        level,
        prize,
        referees,
        sponsors
      } = fields;

      start_date = new Date(start_date);
      end_date = new Date(end_date);
      gender_types = JSON.parse(gender_types);
      age_categories = JSON.parse(age_categories);

      const tournament_details =await prisma.tournaments.create({
        data: {
          user_id: req.user.id,
          logo : logo == '' ? tournamentDefaultImage : logo,
          tournament_name,
          address,
          start_date, //date should be in YYYY-mm-dd format
          end_date,
          gender_types,
          age_categories,
          level,
          prize,
        },
      });

      referees.map(async(referee)=>{
        await prisma.tournament_referees.create({
          data:{
            tournament_id: tournament_details.id,
            name: referee.name,
            mobile: referee.mobile
          }
        })
      })

      sponsors.map(async(sponsor)=>{
        await prisma.tournament_sponsors.create({
          data:{
            tournament_id: tournament_details.id,
            title: sponsor.name,
            logo: sponsor.logo
          }
        })
      })

      res.status(201).json({
        success: true,
        message:
          "Registration successfull. Soon Admin will verify your tournament.",
      });
    });
  });
});

const allTournaments = catchAsyncErrors(async (req, res, next) => {
  const all_tournaments = await prisma.tournaments.findMany({
    where: {
      is_approved: true,
    },
    include: {
      users: true,
    },
  });

  res.status(200).json({ success: true, all_tournaments });
});

const tournamentOfOrganizer = catchAsyncErrors(async (req, res, next) => {
  const user_id = req.user.id;

  const tournaments = await prisma.tournaments.findMany({
    where: {
      user_id,
    },
  });

  res.status(200).json({ success: true, tournaments });
});

async function uploadTournamentLogo(files, logo) {

  if (!files || !files.logo) {
    return logo.length <= 2 ? tournamentDefaultImage : logo;
  }

  try {
    if (logo && logo != tournamentDefaultImage) {
      await deleteImage(logo);
    }
    return await uploadImage(files.logo, "tournament_images");
  } catch (error) {
    throw new Error(error.message);
  }
}

const updateTournamentDetails = catchAsyncErrors(async (req, res, next) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async function (err, fields, files) {

    fields.referees = JSON.parse(fields.referees)
    fields.sponsors = JSON.parse(fields.sponsors)

    if (err) {
      return next(new ErrorHandler(err.message, 500));
    }
    
    //uploading tournament logo
    let logo = fields.old_url
    logo = await uploadTournamentLogo(files, logo) 

    const tournament_id = Number(req.params.tournament_id);
    const {
      tournament_name,
      address,
      start_date,
      end_date,
      level,
      prize,
      about,
      referees,
      sponsors
    } = fields;

    let gender_types = JSON.parse(fields.gender_types);
    let age_categories = JSON.parse(fields.age_categories);

    await prisma.tournaments.update({
      where: {
        id: Number(tournament_id),
      },
      data: {
        tournament_name,
        logo,
        address,
        start_date: new Date(start_date), //date should be in YYYY-mm-dd format
        end_date: new Date(end_date),
        gender_types,
        age_categories,
        about,
        level,
        prize,
      },
    });

    //Deleting tournament referees
    await prisma.tournament_referees.deleteMany({
      where:{
        tournament_id
      }
    })

    //Adding tournament referees
    for(let i=0; i< referees.length; i++) {
      if(referees[i].name != '' && referees[i].mobile != ''){
        await prisma.tournament_referees.create({
          data:{
            name: referees[i].name,
            mobile: referees[i].mobile,
            tournament_id
          }
        })
      }
    }

    //Uploading logo of sponsors
    for(let i=0; i< sponsors.length; i++){
      if(sponsors[i].name != '' && sponsors[i].logo != ''){
        if (Object.keys(sponsors[i].logo).length == 0) {
          //upload new logo
          const imageUrl = await uploadImage(files[`sponsors_logo${i}`], "tournament_sponsors") 
          sponsors[i].logo = imageUrl
        } 
      }
    }

    //Finding tournament sponsors
    const all_sponsors = await prisma.tournament_sponsors.findMany({
      where:{
        tournament_id
      }
    })

    //deleting sponsors logos from imagekit
    for(let i=0; i<all_sponsors.length; i++){
      await deleteImage(all_sponsors[i].logo)
    }

    //Deleting tournament sponsors
    await prisma.tournament_sponsors.deleteMany({
      where:{
        tournament_id
      }
    })

    
    //Add new sponsors 
    for(let i=0; i< sponsors.length; i++){
      if(sponsors[i].name != '' && sponsors[i].logo != ''){
        await prisma.tournament_sponsors.create({
          data:{
            title: sponsors[i].name,
            logo: sponsors[i].logo,
            tournament_id
          }
        })
      }
    }

    res
      .status(200)
      .json({ success: true, message: "Tournament details updated" });
  });
});

const deleteTournament = catchAsyncErrors(async (req, res, next)=>{
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

})

const tournamentDetails = catchAsyncErrors(async (req, res, next) => {
  const { tournament_id } = req.params;

  const tournamentDetails = await prisma.tournaments.findFirst({
    where: { id: Number(tournament_id)},
    include: {
      tournament_sponsors: true,
      tournament_referees: true,
      tournament_teams: {
        where: {
          is_selected: 1,
        },
        include: {
          teams: true,
          tournament_teams_reg_type: true
        },
      },
      matches: {
        include: {
          tournaments: true,
          match_quarters: true,
          team_1:  true,
          team_2: true,
          won_by_team: true,
        },
        orderBy: [
          { start_date: "desc" },
          { start_time: "desc" }
        ],
      },
      gallery: true,
      users: true,
    },
  });

  if (!tournamentDetails) {
    return next(new ErrorHandler("Tournament not found", 404));
  }

  res.status(200).json({ success: true, tournamentDetails });
});

const tournamentSchedule = catchAsyncErrors(async (req, res, next) => {
  const { tournament_id } = req.params;

  const rounds = await prisma.matches.groupBy({
    by: ["round_name"],
    where: {
      tournament_id: Number(tournament_id),
    },
    orderBy: [{ _max: { created_at: 'desc' } }],
  })
  
  let schedule = [];

  if (rounds[0]?.round_name != null) {
    for (let i = 0; i < rounds.length; i++) {
      const match_details = await prisma.matches.findMany({
        where: {
          round_name: rounds[i].round_name,
        },
        include: {
          team_1: true,
          team_2: true,
          scorekeeper: true
        },
        orderBy: {
          created_at: "desc",
        },
      });

      schedule.push({
        round_name: rounds[i].round_name,
        matches: match_details,
      });
    }
  }

  return res.status(200).json({ success: true, schedule });
});

const uploadGalleryImage = catchAsyncErrors(async (req, res, next) => {
    const {tournament_id} = req.params;

    const form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
      if (err) {
          return res.status(500).json({ success: false, message: err.message });
      }

      let photo = "";
      photo = await uploadImage(files.image, 'gallery');
      await prisma.gallery.create({
          data: {
              photo: photo,
              category: fields.category,
              tournament_id: Number(tournament_id)
          },
      });

      res.status(200).json({
        success: true,
        message: "Gallery image uploaded successfully"
      })

    });
})

const deleteGalleryImage = catchAsyncErrors(async (req, res, next) => {
  const {gallery_id} = req.params;

  const galleryDetails = await prisma.gallery.delete({
    where:{
      id: Number(gallery_id),
    }
  })

  await deleteImage(galleryDetails.photo)

  res.status(200).json({success: true, message: 'Image deleted successfully'})
})

const startRegistration = catchAsyncErrors(async (req, res, next) => {
  const { tournament_id } = req.params;

  await prisma.tournaments.update({
    where: {
      id: Number(tournament_id),
    },
    data: {
      is_registration_open: true,
    },
  });

  res
    .status(200)
    .json({ success: true, message: "Registration started successfully" });
});

const closeRegistration = catchAsyncErrors(async (req, res, next) => {
  const { tournament_id } = req.params;

  await prisma.tournaments.update({
    where: {
      id: Number(tournament_id),
    },
    data: {
      is_registration_open: false,
    },
  });

  res
    .status(200)
    .json({ success: true, message: "Registration closed successfully" });
});

const startTournament = catchAsyncErrors(async (req, res, next) => {
  const { tournament_id } = req.params;
  await prisma.tournaments.update({
    where: {
      id: Number(tournament_id),
    },
    data: {
      status: 2, //2 == live
      is_details_editable: false,
      is_registration_open: false,
    },
  });

  res
    .status(200)
    .json({ success: true, message: "Tournament started successfully" });
});

const endTournament = catchAsyncErrors(async (req, res, next) => {
  const { tournament_id } = req.params;

  await prisma.tournaments.update({
    where: {
      id: Number(tournament_id),
    },
    data: {
      status: 3, //3 == completed
      is_details_editable: false,
    },
  });

  res
    .status(200)
    .json({ success: true, message: "Tournament ended successfully" });
});

const teamsRequests = catchAsyncErrors(async (req, res, next) => {
  const tournament_id = Number(req.params.tournament_id);

  const teams = await prisma.tournament_teams.findMany({
    where: {
      tournament_id,
      is_selected: 2, //pending
    },
    include: {
      teams: true,
    },
  });

  res.status(200).json({ success: true, teams });
});

const acceptTeamRequest = catchAsyncErrors(async (req, res, next) => {
  const tournament_id = Number(req.params.tournament_id);
  const team_id = Number(req.body.team_id);

  const tournament_team = await prisma.tournament_teams.findFirst({
    where: {
      tournament_id,
      team_id,
    },
  });

  await prisma.tournament_teams.update({
    where: {
      id: tournament_team.id,
    },
    data: {
      is_selected: 1,
    },
  });

  res
    .status(200)
    .json({ success: true, message: "Team selected successfully" });
});

const rejectTeamRequest = catchAsyncErrors(async (req, res, next) => {
  const tournament_id = Number(req.params.tournament_id);
  const team_id = Number(req.body.team_id);
  const reject_reason = req.body.reject_reason;

  const tournament_team = await prisma.tournament_teams.findFirst({
    where: {
      tournament_id,
      team_id,
    },
  });

  await prisma.tournament_teams.update({
    where: {
      id: tournament_team.id,
    },
    data: {
      is_selected: 0,
      reject_reason,
    },
  });

  res
    .status(200)
    .json({ success: true, message: "Team rejected successfully" });
});

const disqualifyTeam = catchAsyncErrors(async (req, res, next) => {
  const {tournament_teams_id} = req.body

  await prisma.tournament_teams_reg_type.update({
    where: {
      id: tournament_teams_id,
    },
    data: {
      is_disqualified: true,
    },
  });

  res
    .status(200)
    .json({ success: true, message: "Team disqualified successfully" });
});

const requalifyTeam = catchAsyncErrors(async (req, res, next) => {
  const { tournament_id } = req.params;
  const {tournament_teams_id} = req.body

  await prisma.tournament_teams_reg_type.update({
    where: {
      id: tournament_teams_id,
    },
    data: {
      is_disqualified: false
    },
  });

  res
    .status(200)
    .json({ success: true, message: "Team requalified successfully" });
});

const isAuthenticOrganizer = (req, res) =>{
  res
    .status(200)
    .json({ success: true});
}

const createPools = catchAsyncErrors(async (req, res, next) => {
  const tournament_id = Number(req.params.tournament_id);
  const teams_per_group = Number(req.body.teams_per_group);
  const gender_type = req.body.gender_type;
  const age_type = req.body.age_type;

  const pool_names = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "P",
    "Q",
  ];

  const all_teams = await prisma.tournament_teams.findMany({
    where: {
      tournament_id,
      is_selected: 1,
      gender_type: {
        hasEvery: [gender_type],
      },
      age_categories: {
        hasEvery: [age_type],
      },
    },
  });

  if (all_teams.length % teams_per_group != 0) {
    return next(
      new ErrorHandler(
        `Can't make pools with ${teams_per_group} teams per group`,
        400
      )
    );
  }

  //shuffling the teams in an array
  for (let i = 0; i < 10; ) {
    const random_no_1 = Math.floor(Math.random() * 10) % all_teams.length;
    const random_no_2 = Math.floor(Math.random() * 10) % all_teams.length;

    if (random_no_1 != random_no_2) {
      i++;
      let temp = all_teams[random_no_1];
      all_teams[random_no_1] = all_teams[random_no_2];
      all_teams[random_no_2] = temp;
    }
  }

  //Giving pool names to the teams
  let j = 0,
    count = 1;
  for (let i = 0; i < all_teams.length; i++) {
    const reg_type_data = await prisma.tournament_teams_reg_type.findFirst({
      where: {
        AND:[
          { tournament_team_id: all_teams[i].id },
          { age_category: age_type },
          { gender_type }
        ]
      },
    })
    await prisma.tournament_teams_reg_type.update({
      where: {
        id : reg_type_data.id
      },
      data: {
        pool_name: pool_names[j],
      },
    });

    if (count == teams_per_group) {
      count = 1;
      j++;
    } else {
      count++;
    }
  }

  res
    .status(200)
    .json({ success: true, message: "Pools created successfully" });
});

const matchFormation = catchAsyncErrors(async (req, res, next) => {
  const tournament_id = Number(req.params.tournament_id);
  const round_name = req.body.round_name;
  const formation_method = req.body.formation_method;
  const is_formation_by_group = req.body.is_formation_by_group;
  const gender_type = req.body.gender_type;
  const age_type = req.body.age_type;

  const tournament_details = await prisma.tournaments.findUnique({
    where: { id: tournament_id },
  });

  //checking if the registration is open
  if (tournament_details.is_registration_open) {
    return next(new ErrorHandler("Please close the registration", 400));
  }

  //checking if teams are available as per selected age_category
  const tour_teams_age_wise = await prisma.tournament_teams_reg_type.findMany({
    where: {
      tournament_teams:{
        tournament_id,
        is_selected: 1,
      },
      is_disqualified: false,
      age_category: age_type
    },
  });

  if (tour_teams_age_wise.length == 0) {
    return next(new ErrorHandler("No teams for selected age category", 400));
  }

  //checking if teams are available as per selected gender_type
  const tour_teams_gender_wise = await prisma.tournament_teams_reg_type.findMany({
    where: {
      tournament_teams:{
        tournament_id,
        is_selected: 1,
      },
      is_disqualified: false,
      gender_type: gender_type
    },
  });

  if (tour_teams_gender_wise.length == 0) {
    return next(new ErrorHandler("No teams for selected gender type", 400));
  }

  if (is_formation_by_group) {
    const pools = await prisma.tournament_teams_reg_type.groupBy({
      by: ["pool_name"],
      where: {
        tournament_teams:{
          tournament_id,
          is_selected: 1,
        },
        is_disqualified: false,
        age_category: age_type,
        gender_type: gender_type
      },
    });

    //checking if pools are created or not
    if (pools.length == 1 && pools[0].pool_name == null) {
      return next(new ErrorHandler("Please create pools", 400));
    } 
    else {
      //checking if any team not allocated to pool
      for (let i = 0; i < pools.length; i++) {
        if (pools[i].pool_name == null) {
          return next(new ErrorHandler("Please create pools again", 400));
        }
      }
    }

    //ROUND ROBIN formation in pools
    if (formation_method == "league") {
      for (let i = 0; i < pools.length; i++) {
        const teams = await prisma.tournament_teams_reg_type.findMany({
          where: {
            tournament_teams:{
              tournament_id,
              is_selected: 1,
            },
            is_disqualified: false,
            pool_name: pools[i].pool_name,
            age_category: age_type,
            gender_type: gender_type,
          },
          include:{
            tournament_teams:{
              include:{
                teams: true
              }
            }
          }
        });

      let j = 0,
        k = 0;
      while (j < teams.length) {
        k = j + 1;
        while (k < teams.length) {
          const match_data = await prisma.matches.create({
            data: {
              tournament_id,
              team_1_id: teams[j].tournament_teams.team_id,
              team_2_id: teams[k].tournament_teams.team_id,
              address: tournament_details.address,
              round_name,
            },
          });

            //Adding match players of team 1
            await addMatchPlayers({match_id:match_data.id, team_id: teams[j].tournament_teams.team_id,team_captain_id: teams[j].tournament_teams.teams.captain_id})
            //Adding match players of team 2
            await addMatchPlayers({match_id:match_data.id, team_id: teams[k].tournament_teams.team_id,team_captain_id: teams[k].tournament_teams.teams.captain_id})
            
            k++;
          }
          j++;
        }
      }
    } 
    else { //KNOCKOUT formation in pools

      for (let j = 0; j < pools.length; j++) {
        //Finding teams of a particular pools
        const teams = await prisma.tournament_teams_reg_type.findMany({
          where: {
            tournament_teams:{
              tournament_id,
              is_selected: 1,
            },
            is_disqualified: false,
            pool_name: pools[j].pool_name,
            age_category: age_type,
            gender_type: gender_type,
          },
          include:{
            tournament_teams:{
              include:{
                teams: true
              }
            }
          }
        });

        //Cheching if no. of teams is even or not
        if(teams.length % 2 != 0){
          return res.status(400).json({success: true, message: `Can't form match for odd teams in Pool ${pools[j].pool_name}`})
        }

        for (let i = 0; i + 1 < teams.length; i += 2) {
          const match_data = await prisma.matches.create({
            data: {
              tournament_id,
              team_1_id: teams[i].tournament_teams.team_id,
              team_2_id: teams[i + 1].tournament_teams.team_id,
              address: tournament_details.address,
              round_name,
            },
          });

          //Adding match players of team 1
          await addMatchPlayers({match_id:match_data.id, team_id:teams[i].tournament_teams.team_id,team_captain_id: teams[i].tournament_teams.teams.captain_id})

          //Adding match players of team 2
          await addMatchPlayers({match_id:match_data.id, team_id:teams[i+1].tournament_teams.team_id,team_captain_id: teams[i+1].tournament_teams.teams.captain_id})
        }
      }

    }

    return res
      .status(201)
      .json({ success: true, message: "Matches formed successfully" });
  }
  else{
    //ROUND ROBIN formation in without pools
    if (formation_method == "league") {

      const teams = await prisma.tournament_teams_reg_type.findMany({
        where: {
          tournament_teams:{
            tournament_id,
            is_selected: 1,
          },
          is_disqualified: false,
          age_category: age_type,
          gender_type: gender_type,
        },
        include:{
          tournament_teams:{
            include:{
              teams: true
            }
          }
        }
      });

      let j = 0,
        k = 0;
      while (j < teams.length) {
        k = j + 1;
        while (k < teams.length) {
          const match_data = await prisma.matches.create({
            data: {
              tournament_id,
              team_1_id: teams[j].tournament_teams.team_id,
              team_2_id: teams[k].tournament_teams.team_id,
              address: tournament_details.address,
              round_name,
            },
          });

          //Adding match players of team 1
          await addMatchPlayers({match_id:match_data.id, team_id: teams[j].tournament_teams.team_id,team_captain_id: teams[j].tournament_teams.teams.captain_id})
          //Adding match players of team 2
          await addMatchPlayers({match_id:match_data.id, team_id: teams[k].tournament_teams.team_id,team_captain_id: teams[k].tournament_teams.teams.captain_id})
          
          k++;
        }
        j++;
      }
    }
    else{ //KNOCKOUT formation without pools

      //checking if previously divided into upper half and lower half or not
      const result_teams = await prisma.tournament_teams_reg_type.findMany({
        where: {
          tournament_teams:{
            tournament_id,
            is_selected: 1,
          },
          is_disqualified: false,
          age_category: age_type,
          gender_type: gender_type,
          NOT: [{ is_knockout_upperhalf: null }],
        },
      });

      if (result_teams.length > 0) {
       
        const upperhalf_teams = await getKnockoutUpperLowerHalfTeams(
          tournament_id,
          age_type,
          gender_type,
          true
        );

        const lowerhalf_teams = await getKnockoutUpperLowerHalfTeams(
          tournament_id,
          age_type,
          gender_type,
          false
        );

        //Final round
        if (upperhalf_teams.length == 1 && lowerhalf_teams.length == 1) {
          const match_data = await prisma.matches.create({
            data: {
              tournament_id,
              team_1_id: upperhalf_teams[0].tournament_teams.team_id,
              team_2_id: lowerhalf_teams[0].tournament_teams.team_id,
              address: tournament_details.address,
              round_name,
            },
          });

          //Adding match players of team 1
          await addMatchPlayers({match_id:match_data.id, team_id:upperhalf_teams[0].tournament_teams.team_id,team_captain_id: upperhalf_teams[0].tournament_teams.teams.captain_id})
          //Adding match players of team 2
          await addMatchPlayers({match_id:match_data.id, team_id:lowerhalf_teams[0].tournament_teams.team_id,team_captain_id: lowerhalf_teams[0].tournament_teams.teams.captain_id})
        } 
        else {
          //upperhalf match formation
          for (let i = 0; i + 1 < upperhalf_teams.length; i += 2) {
            const match_data = await prisma.matches.create({
              data: {
                tournament_id,
                team_1_id: upperhalf_teams[i].tournament_teams.team_id,
                team_2_id: upperhalf_teams[i + 1].tournament_teams.team_id,
                address: tournament_details.address,
                round_name,
              },
            });

            //Adding match players of team 1
            await addMatchPlayers({match_id:match_data.id, team_id:upperhalf_teams[i].tournament_teams.team_id,team_captain_id: upperhalf_teams[i].tournament_teams.teams.captain_id})

            //Adding match players of team 2
            await addMatchPlayers({match_id:match_data.id, team_id:upperhalf_teams[i+1].tournament_teams.team_id,team_captain_id: upperhalf_teams[i+1].tournament_teams.teams.captain_id})
          }

          //lowerhalf match formation
          for (let i = 0; i + 1 < lowerhalf_teams.length; i += 2) {
            const match_data = await prisma.matches.create({
              data: {
                tournament_id,
                team_1_id: lowerhalf_teams[i].tournament_teams.team_id,
                team_2_id: lowerhalf_teams[i + 1].tournament_teams.team_id,
                address: tournament_details.address,
                round_name,
              },
            });

            //Adding match players of team 1
            await addMatchPlayers({match_id:match_data.id, team_id:lowerhalf_teams[i].tournament_teams.team_id,team_captain_id: lowerhalf_teams[i].tournament_teams.teams.captain_id})

            //Adding match players of team 2
            await addMatchPlayers({match_id:match_data.id, team_id:lowerhalf_teams[i+1].tournament_teams.team_id,team_captain_id: lowerhalf_teams[i+1].tournament_teams.teams.captain_id})
          }
        }
      } 
      else {
        const teams = await prisma.tournament_teams_reg_type.findMany({
          where: {
            tournament_teams:{
              tournament_id,
              is_selected: 1,
            },
            is_disqualified: false,
            age_category: age_type,
            gender_type: gender_type,
          },
          include:{
            tournament_teams:{
              include:{
                teams: true
              }
            }
          }
        });

        let total_byes = 0,
          i = 1;
        while (1) {
          if (teams.length <= Math.pow(2, i)) {
            total_byes = Math.pow(2, i) - teams.length;
            break;
          }
          i++;
        }

        //Finding upper half and lower half total teams
        let upper_half_total_teams =
          teams.length % 2 != 0 ? (teams.length + 1) / 2 : teams.length / 2;
        let lower_half_total_teams =
          teams.length % 2 != 0 ? (teams.length - 1) / 2 : teams.length / 2;

        //Finding upper half and lower half total bye teams
        let upper_half_bye_teams =
          total_byes == 0
          ? 
            0
          : total_byes % 2 != 0
            ? 
              (total_byes - 1) / 2
            : 
              total_byes / 2;

        let lower_half_bye_teams =
          total_byes == 0
          ? 
            0
          : total_byes % 2 != 0
            ? 
              (total_byes + 1) / 2
            : 
              total_byes / 2;

        //Dividing teams array in upper-half and lower-half
        const upperhalf_teams = teams.slice(0, upper_half_total_teams);
        const lowerhalf_teams = teams.slice(
          upper_half_total_teams,
          upper_half_total_teams + lower_half_total_teams
        );

        //updating upperhalf
        for (let i = 0; i < upper_half_total_teams; i++) {
          await prisma.tournament_teams_reg_type.update({
            where:{
              id: upperhalf_teams[i].id,
            },
            data: {
              is_knockout_upperhalf: true,
            },
          })
        }

        //updating lowerhalf
        for (let i = 0; i < lower_half_total_teams; i++) {
          await prisma.tournament_teams_reg_type.update({
            where: {
              id: lowerhalf_teams[i].id,
            },
            data: {
              is_knockout_upperhalf: false,
            },
          });
        }

        //upper half teams (not bye) match formation
        for (
          let i = 0;
          i + 1 < upper_half_total_teams - upper_half_bye_teams;
          i += 2
        ) {
          const match_data = await prisma.matches.create({
            data: {
              tournament_id,
              team_1_id: upperhalf_teams[i].tournament_teams.team_id,
              team_2_id: upperhalf_teams[i + 1].tournament_teams.team_id,
              address: tournament_details.address,
              round_name,
            },
          });
          //Adding match players of team 1
          await addMatchPlayers({match_id:match_data.id, team_id:upperhalf_teams[i].tournament_teams.team_id,team_captain_id: upperhalf_teams[i].tournament_teams.teams.captain_id})

          //Adding match players of team 2
          await addMatchPlayers({match_id:match_data.id, team_id:upperhalf_teams[i+1].tournament_teams.team_id,team_captain_id: upperhalf_teams[i+1].tournament_teams.teams.captain_id})
        }

        //lower half teams (not bye) match formation
        for (
          let i = 0;
          i + 1 < lower_half_total_teams - lower_half_bye_teams;
          i += 2
        ) {
          const match_data = await prisma.matches.create({
            data: {
              tournament_id,
              team_1_id: lowerhalf_teams[i].tournament_teams.team_id,
              team_2_id: lowerhalf_teams[i + 1].tournament_teams.team_id,
              address: tournament_details.address,
              round_name,
            },
          });
          //Adding match players of team 1
          await addMatchPlayers({match_id:match_data.id, team_id:lowerhalf_teams[i].tournament_teams.team_id,team_captain_id: lowerhalf_teams[i].tournament_teams.teams.captain_id})

          //Adding match players of team 2
          await addMatchPlayers({match_id:match_data.id, team_id:lowerhalf_teams[i+1].tournament_teams.team_id,team_captain_id: lowerhalf_teams[i+1].tournament_teams.teams.captain_id})
        }
      }
    }

    return res
      .status(201)
      .json({ success: true, message: "Matches formed successfully" });
  }
});

//Helper functions
async function addMatchPlayers({ match_id, team_id, team_captain_id }) {
  const players = await prisma.team_players.findMany({
    where: {
      team_id,
    },
  });

  players.map(async (player) => {
    await prisma.match_players.create({
      data: {
        match_id,
        team_id,
        player_id: player.player_id,
        is_captain: player.player_id == team_captain_id ? true : false,
      },
    });
  });
}

async function getKnockoutUpperLowerHalfTeams(
  tournament_id,
  age_type,
  gender_type,
  is_knockout_upperhalf
) {

  let tournament_teams = await prisma.tournament_teams_reg_type.findMany({
    where: {
      tournament_teams:{
        tournament_id,
        is_selected: 1,
      },
      age_category: age_type,
      gender_type: gender_type,
      is_disqualified: false,
      is_knockout_upperhalf
    },
    include:{
      tournament_teams:{
        include:{
          teams: true
        }
      }
    }
  });

  return tournament_teams
}

module.exports = {
  tournamentRegistration,
  allTournaments,
  tournamentOfOrganizer,
  updateTournamentDetails,
  deleteTournament,
  tournamentDetails,
  tournamentSchedule,
  uploadGalleryImage,
  deleteGalleryImage,
  startRegistration,
  closeRegistration,
  startTournament,
  endTournament,
  teamsRequests,
  acceptTeamRequest,
  rejectTeamRequest,
  disqualifyTeam,
  requalifyTeam,
  isAuthenticOrganizer,
  createPools,
  matchFormation,
};

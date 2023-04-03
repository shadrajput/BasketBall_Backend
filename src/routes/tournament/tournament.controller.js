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

const tournamentRegistration = catchAsyncErrors(async (req, res, next) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    // console.log(fields);
    const sponsors = JSON.parse(fields.sponsors)

    let sponsors_logo = []; 
    for (let i=0; i<sponsors.length; i++) {
      sponsors_logo.push(files[`sponsors_logo${i}`])
    } 

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
      return next(new ErrorHandler("Please change the tournament name"));
    }

    //Uploading tournament logo
    let logo = "";

    const myPromise = new Promise(async (resolve, reject) => {

      if (files.logo && files.logo.originalFilename != "" && files.logo.size != 0) {
        const ext = files.logo.mimetype.split("/")[1].trim();

        if (files.logo.size >= 2097152) {
          // 2097152(bytes) = 2MB
          return next(
            new ErrorHandler("Photo size should be less than 2MB", 400)
          );
        }
        if (ext != "png" && ext != "jpg" && ext != "jpeg") {
          return next(
            new ErrorHandler("Only JPG, JPEG or PNG logo is allowed", 400)
          );
        }

        var oldPath = files.logo.filepath;
        var fileName = Date.now() + "_" + files.logo.originalFilename;

        fs.readFile(oldPath, function (err, data) {
          if (err) {
            return next(new ErrorHandler(err.message, 500));
          }
          imagekit.upload(
            {
              file: data,
              fileName: fileName,
              overwriteFile: true,
              folder: "/tournament_images",
            },
            function (error, result) {
              if (error) {
                return next(new ErrorHandler(error.message, 500));
              }
              logo = result.url;
            }
          );
        });
      } 

      //uploading sponsors logo
      for(let i=0; i<sponsors_logo.length; i++){
        if(sponsors_logo[i].originalFilename != '' && sponsors_logo[i].size != 0){
          const ext = sponsors_logo[i].mimetype.split("/")[1].trim();

          if (sponsors_logo[i].size >= 2097152) {
            // 2097152(bytes) = 2MB
            return next(
              new ErrorHandler("Sponsor logo size should be less than 2MB", 400)
            );
          }
          if (ext != "png" && ext != "jpg" && ext != "jpeg") {
            return next(
              new ErrorHandler("Only JPG, JPEG or PNG sponsor logos are allowed", 400)
            );
          }

          var oldPath = sponsors_logo[i].filepath;
          var fileName = Date.now() + "_" + sponsors_logo[i].originalFilename;

          const data = fs.readFileSync(oldPath);
          if (!data) {
            return next(new ErrorHandler('Something went wrong', 500));
          }

          const result = await imagekit.upload({
            file: data,
            fileName: fileName,
            overwriteFile: true,
            folder: "/sponsors_images",
          });

          if (!result) {
            return next(new ErrorHandler('Something went wrong', 500));
          }

          let imageData = [result];
          imageData.map((item)=>{
            sponsors[i].logo = item.url
          })
        }
      }
      resolve()
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
        about,
        referees
      } = fields;

      start_date = new Date(start_date);
      end_date = new Date(end_date);
      gender_types = JSON.parse(gender_types);
      age_categories = JSON.parse(age_categories);
      //removing underscore from value
      age_categories.map((item, i)=>{
        const age = item.split('_')
        age_categories[i] = `${age[0]} ${age[1]}}`
      })
      referees = JSON.parse(referees);

      const tournament_details = await prisma.tournaments.create({
        data: {
          user_id: 1,
          logo,
          tournament_name,
          address,
          start_date, //date should be in YYYY-mm-dd format
          end_date,
          gender_types,
          age_categories,
          level,
          prize,
          about
        },
      });

      //Adding referees
      referees.map(async (item)=>{
        await prisma.tournament_referees.create({
          data:{
            tournament_id: tournament_details.id,
            name: item.name,
            mobile: item.mobile,
          }
        })
      })

      //Adding sponsors
      sponsors.map(async(item)=>{
        await prisma.tournament_sponsors.create({
          data:{
            tournament_id: tournament_details.id,
            logo: item.logo,
            title: item.name
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
    orderBy: {
      created_at: "desc",
    },
  });

  res.status(200).json({ success: true, all_tournaments });
});

const updateTournamentDetails = catchAsyncErrors(async (req, res, next) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    let logo = "";
    const myPromise = new Promise(async (resolve, reject) => {
      //Searching and deleting old photo from imagekit
      if (fields.old_logo_url != fields.logo_name) {
        //Searching old photo
        const old_logo_name = fields.old_logo_url.split("/")[5];
        let old_logo_fileId = "";

        imagekit.listFiles(
          {
            searchQuery: `'name'="${old_logo_name}"`,
          },
          function (error, result) {
            if (error) {
              return next(new ErrorHandler("Failed to update logo", 500));
            }
            if (result && result.length > 0) {
              old_logo_fileId = result[0].fileId;

              //Deleting old photo
              imagekit.deleteFile(old_logo_fileId, function (error, result) {
                if (error) {
                  return next(new ErrorHandler("Failed to update logo", 500));
                }
              });
            }
          }
        );
      }

      if (files.logo.originalFilename != "" && files.logo.size != 0) {
        const ext = files.logo.mimetype.split("/")[1].trim();

        if (files.logo.size >= 2000000) {
          // 2000000(bytes) = 2MB
          return next(
            new ErrorHandler("Photo size should be less than 2MB", 400)
          );
        }
        if (ext != "png" && ext != "jpg" && ext != "jpeg") {
          return next(
            new ErrorHandler("Only JPG, JPEG or PNG logo is allowed", 400)
          );
        }

        var oldPath = files.logo.filepath;
        var fileName = Date.now() + "_" + files.logo.originalFilename;

        fs.readFile(oldPath, function (err, data) {
          if (err) {
            return next(new ErrorHandler(err.message, 500));
          }
          imagekit.upload(
            {
              file: data,
              fileName: fileName,
              overwriteFile: true,
              folder: "/tournament_images",
            },
            function (error, result) {
              if (error) {
                return next(new ErrorHandler(error.message, 500));
              }
              logo = result.url;
              resolve();
            }
          );
        });
      } else {
        resolve();
      }
    });

    myPromise.then(async () => {
      const { tournament_id } = req.params;

      const {
        tournament_name,
        address,
        start_date,
        end_date,
        gender_types,
        age_categories, 
        level,
        prize,
      } = fields;

      await prisma.tournaments.update({
        where: {
          id: Number(tournament_id),
        },
        data: {
          tournament_name,
          address,
          start_date: new Date(start_date), //date should be in YYYY-mm-dd format
          end_date: new Date(end_date),
          gender_types,
          age_categories,
          level,
          prize,
        },
      });

      res
        .status(200)
        .json({ success: true, message: "Tournament details updated" });
    });
  });
});

const tournamentDetails = catchAsyncErrors(async (req, res, next) => {
  const { tournament_id } = req.params;

  const tournamentDetails = await prisma.tournaments.findFirst({
    where: { id: Number(tournament_id), is_approved: true },
    include: {
      tournament_sponsors: true,
      tournament_referees: true,
      tournament_teams: {
        include: {
          teams: true
        }
      },
      matches: true,
      gallery: true,
      users: true,
    },
  });

  if (!tournamentDetails) {
    return next(new ErrorHandler("Tournament not found", 404));
  }

  res.status(200).json({ success: true, tournamentDetails});
});

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

  console.log('ok')

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
      is_registration_open: false
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
    include:{
      teams: true,
    }
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
  const { tournament_id, team_id } = req.params;

  const tournament_teams_id = await prisma.tournament_teams.findFirst({
    where: {
      AND: [
        { tournament_id: Number(tournament_id) },
        { team_id: Number(team_id) },
        { is_selected: 1 },
      ],
    },
  });

  await prisma.tournament_teams.update({
    where: {
      id: tournament_teams_id,
    },
    data: {
      status: 3, //3 == completed
      is_details_editable: false,
    },
  });

  res
    .status(200)
    .json({ success: true, message: "Team disqualified successfully" });
});

const createPools = catchAsyncErrors(async (req, res, next) => {
  const tournament_id = Number(req.params.tournament_id);
  const total_groups = req.body.total_groups;
  const teams_per_group = req.body.teams_per_group;

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
      is_disqualified: false,
      is_selected: 1,
    },
  });

  if (all_teams % teams_per_group != 0) {
    return new ErrorHandler(
      `Can't make pools with ${teams_per_group} teams per group`,
      400
    );
  }

  //shuffling the teams in an array
  for (let i = 0; i < 10; ) {
    const random_no_1 = Match.floor(Math.random() * 10);
    const random_no_2 = Match.floor(Math.random() * 10);

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
    await prisma.tournament_teams.update({
      where: {
        id: all_teams[i].id,
      },
      data: {
        pool_name: pool_names[j],
      },
    });

    if (count == teams_per_group) {
      count = 1;
      j++;
    }
  }
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

  if (is_formation_by_group) {
    const pools = await prisma.tournament_teams.groupBy({
      by: ["pool_name"],
      where: {
        tournament_id,
        is_selected: 1,
        is_disqualified: false,
      },
    });

    //ROUND ROBIN formation
    if (formation_method == "league") {
      for (let i = 0; i < pools.length; i++) {
        const teams = await prisma.tournament_teams.findMany({
          where: {
            tournament_id,
            is_seleted: 1,
            is_disqualified: false,
            pool_name: pools[i].pool_name,
            age_categories: {
              hasEvery: [age_type],
            },
            gender_type: {
              hasEvery: [gender_type],
            },
          },
        });

        let j = 0,
          k = 0;
        while (j < teams.length) {
          k = j + 1;
          while (k < teams.length) {
            k++;
            await prisma.matches.create({
              data: {
                tournament_id,
                team_1_id: teams[j].team_id,
                team_2_id: teams[k].team_id,
                address: tournament_details.address,
                round_name,
              },
            });
          }
          j++;
        }
      }
    } else {
      //KNOCKOUT formation

      //checking if previously divided into upper half and lower half or not
      const result_teams = await prisma.tournament_teams.findMany({
        where: {
          tournament_id,
          is_seleted: 1,
          is_disqualified: false,
          NOT: [{ is_knockout_upperhalf: null }],
          age_categories: {
            hasEvery: [age_type],
          },
          gender_type: {
            hasEvery: [gender_type],
          },
        },
      });

      if (result_teams.length > 0) {
        const upperhalf_teams = getKnockoutUpperLowerHalfTeams(
          tournament_id,
          age_type,
          gender_type,
          true
        );

        const lowerhalf_teams = getKnockoutUpperLowerHalfTeams(
          tournament_id,
          age_type,
          gender_type,
          false
        );

        //Final round
        if (upperhalf_teams.length == 1 && lowerhalf_teams.length == 1) {
          await prisma.matches.create({
            data: {
              tournament_id,
              team_1_id: upperhalf_teams[0].team_id,
              team_2_id: lowerhalf_teams[0].team_id,
              address: tournament_details.address,
              round_name,
            },
          });
        } else {
          //upperhalf match formation
          for (let i = 0; i + 1 < upperhalf_teams.length; i += 2) {
            await prisma.matches.create({
              data: {
                tournament_id,
                team_1_id: upperhalf_teams[i].team_id,
                team_2_id: upperhalf_teams[i + 1].team_id,
                address: tournament_details.address,
                round_name,
              },
            });
          }

          //lowerhalf match formation
          for (let i = 0; i + 1 < lowerhalf_teams.length; i += 2) {
            await prisma.matches.create({
              data: {
                tournament_id,
                team_1_id: lowerhalf_teams[i].team_id,
                team_2_id: lowerhalf_teams[i + 1].team_id,
                address: tournament_details.address,
                round_name,
              },
            });
          }
        }
      } else {
        const teams = await prisma.tournament_teams.findMany({
          where: {
            tournament_id,
            is_seleted: 1,
            is_disqualified: false,
            age_categories: {
              hasEvery: [age_type],
            },
            gender_type: {
              hasEvery: [gender_type],
            },
          },
        });

        let total_byes = 0,
          i = 1;
        while (1) {
          if (teams.length < Math.pow(2, i)) {
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
          total_byes % 2 != 0 ? (total_byes - 1) / 2 : total_byes / 2;
        let lower_half_bye_teams =
          total_byes % 2 != 0 ? (total_byes + 1) / 2 : total_byes / 2;

        //Dividing teams array in upper-half and lower-half
        const upperhalf_teams = teams.slice(0, upper_half_total_teams - 1);
        const lowerhalf_teams = teams.slice(
          upper_half_total_teams,
          lower_half_total_teams - 1
        );

        //updating upperhalf
        for (let i = 0; i < upper_half_total_teams; i++) {
          await prisma.tournament_teams.update({
            where: {
              id: upperhalf_teams[i].id,
            },
            data: {
              is_knockout_upperhalf: true,
            },
          });
        }

        //updating lowerhalf
        for (let i = 0; i < lower_half_total_teams; i++) {
          await prisma.tournament_teams.update({
            where: {
              id: lowerhalf_teams[i].id,
            },
            data: {
              is_knockout_upperhalf: false,
            },
          });
        }

        // const upperhalf_teams = getKnockoutUpperLowerHalfTeams(
        //   tournament_id,
        //   age_type,
        //   gender_type,
        //   true
        // );

        // const lowerhalf_teams = getKnockoutUpperLowerHalfTeams(
        //   tournament_id,
        //   age_type,
        //   gender_type,
        //   false
        // );

        //upper half teams (not bye) match formation
        for (
          let i = 0;
          i + 1 < upper_half_total_teams - upper_half_bye_teams;
          i += 2
        ) {
          await prisma.matches.create({
            data: {
              tournament_id,
              team_1_id: upperhalf_teams[i].team_id,
              team_2_id: upperhalf_teams[i + 1].team_id,
              address: tournament_details.address,
              round_name,
            },
          });
        }

        //lower half teams (not bye) match formation
        for (
          let i = 0;
          i + 1 < lower_half_total_teams - lower_half_bye_teams;
          i += 2
        ) {
          await prisma.matches.create({
            data: {
              tournament_id,
              team_1_id: lowerhalf_teams[i].team_id,
              team_2_id: lowerhalf_teams[i + 1].team_id,
              address: tournament_details.address,
              round_name,
            },
          });
        }
      }
    }

    res
      .status(201)
      .json({ success: true, message: "Matches formed successfully" });
  }
});

//Helper function
async function getKnockoutUpperLowerHalfTeams(
  tournament_id,
  age_type,
  gender_type,
  is_knockout_upperhalf
) {
  return await prisma.tournament_teams.findMany({
    where: {
      tournament_id,
      is_seleted: 1,
      is_disqualified: false,
      is_knockout_upperhalf,
      age_categories: {
        hasEvery: [age_type],
      },
      gender_type: {
        hasEvery: [gender_type],
      },
    },
  });
}

module.exports = {
  tournamentRegistration,
  allTournaments,
  updateTournamentDetails,
  tournamentDetails,
  startRegistration,
  closeRegistration,
  startTournament,
  endTournament,
  teamsRequests,
  acceptTeamRequest,
  rejectTeamRequest,
  disqualifyTeam,
  createPools,
  matchFormation,
};

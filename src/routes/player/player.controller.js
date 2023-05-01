const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");
const { PrismaClient } = require("@prisma/client");
const ErrorHandler = require("../../utils/ErrorHandler");
const ImageKit = require("imagekit");
const formidable = require("formidable");
const fs = require("fs");
const {
  uploadImage,
  deleteImage,
  DefaultplayerImage,
} = require("../../helper/imageUpload");

const prisma = new PrismaClient();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// ----------------------------------------------------
// ------------------ Registration --------------------
// ----------------------------------------------------
const playerRegistration = catchAsyncErrors(async (req, res, next) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    try {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      const playerData = JSON.parse(fields?.data);
      const { basicInfo, gameInfo } = playerData.PlayerInfo;
      const result = await prisma.players.findFirst({
        where: {
          AND: [
            {
              mobile: {
                contains: basicInfo.mobile,
                mode: "insensitive",
              },
            },
          ],
        },
      });

      if (result) {
        return next(new ErrorHandler("Please Change Mobile Number"));
      }

      let photo = "";

      photo = await uploadLogo(files, photo);
      const data = await prisma.players.create({
        data: {
          user_id: req.user.id,
          photo: photo,
          first_name: basicInfo.first_name,
          middle_name: basicInfo.middle_name,
          last_name: basicInfo.last_name,
          alternate_mobile: basicInfo.alternate_mobile,
          gender: basicInfo.gender,
          height: Number(gameInfo.height),
          weight: Number(gameInfo.weight),
          pincode: basicInfo.pincode,
          mobile: basicInfo.mobile,
          playing_position: gameInfo.playing_position,
          jersey_no: Number(gameInfo.jersey_no),
          about: gameInfo.about,
          date_of_birth: new Date(basicInfo.date_of_birth),
        },
      });

      await prisma.player_statistics.create({
        data: {
          player_id: data.id
        }
      })

      await prisma.users.update({
        where: {
          id: req.user.id
        },
        data: {
          is_player: true
        }
      })

      res.status(201).json({
        data: data,
        success: true,
        message: "Registration successfull.",
      });
    } catch (error) {
      next(error)
    }
  });
});

// ----------------------------------------------------
// -------------------- all_Player --------------------
// ----------------------------------------------------
const allPlayers = catchAsyncErrors(async (req, res, next) => {
  let { page, PlayerName } = req.params;
  PlayerName = PlayerName == "search" ? "" : PlayerName;
  const itemsPerPage = 10

  try {
    const all_players = await prisma.players.findMany({
      skip: page * itemsPerPage,
      take: itemsPerPage,
      where: {
        first_name: {
          contains: PlayerName == "" ? "" : PlayerName,
          mode: "insensitive",
        },
      },
      include: {
        player_statistics: {
          orderBy: { points: "desc" },
        },
        users: true,
        team_players: {
          include: {
            teams: true,
          },
        },
      },
    });

    const totalPlayers = await prisma.players.count();

    return res.status(200).json({ 
      success: true, 
      pageCount: Math.ceil(totalPlayers / itemsPerPage),
      data: all_players 
    });
  } catch (error) {
    next(error);
  }
});

// ----------------------------------------------------
// ------------ one_Player_Details_BY_Id --------------
// ----------------------------------------------------
const onePlayerDetailsbyId = catchAsyncErrors(async (req, res, next) => {
  const { player_id } = req.params;
  try {
    const SinglePlayerDetails = await prisma.players.findFirst({
      where: {
        id: Number(player_id),
      },
      include: {
        player_statistics: true,
        users: true,
        team_players: {
          include: {
            teams: true,
          },
        },
        match_players: {
          include: {
            matches: true,
          },
        },
      },
    });

    res.status(200).json({
      SinglePlayerDetails: SinglePlayerDetails,
      success: true,
      message: "Single player details",
    });
  } catch (error) {
    next(error);
  }
});

// ----------------------------------------------------
// ------------ one_Player_Details_BY_Number --------------
// ----------------------------------------------------
const onePlayerDetailsbyNumber = catchAsyncErrors(async (req, res, next) => {
  let { number } = req.params;

  number = number.length < 4 ? "" : number;
  try {
    const SinglePlayerDetails = await prisma.players.findFirst({
      where: {
        mobile: number,
      },
    });

    res.status(200).json({
      data: SinglePlayerDetails,
      success: true,
    });
  } catch (error) {
    next(error);
  }
});

// ----------------------------------------------------
// ------------------ Update_Player -------------------
// ----------------------------------------------------
const updatePlayerDetails = catchAsyncErrors(async (req, res, next) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {

    try {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      const playerData = JSON.parse(fields?.data);
      const { basicInfo, gameInfo } = playerData.PlayerInfo;
      let photo = basicInfo?.photo?.length ? basicInfo?.photo : ""
      photo = await uploadLogo(files, photo);
      const data = await prisma.players.update({
        where: {
          id: Number(basicInfo.id)
        },
        data: {
          first_name: basicInfo.first_name,
          photo,
          middle_name: basicInfo.middle_name,
          last_name: basicInfo.last_name,
          mobile: Number(basicInfo.mobile),
          alternate_mobile: basicInfo.alternate_mobile,
          gender: basicInfo.gender,
          height: Number(gameInfo.height),
          weight: Number(gameInfo.weight),
          pincode: basicInfo.pincode,
          mobile: basicInfo.mobile,
          playing_position: gameInfo.playing_position,
          jersey_no: Number(gameInfo.jersey_no),
          about: gameInfo.about,
          date_of_birth: new Date(basicInfo.date_of_birth),
        },
      });

      res.status(201).json({
        data: data,
        success: true,
        message: "Player Details Update Successfull.",
      });
    } catch (error) {
      next(error);
    }
  });
});

// ----------------------------------------------------
// ------------------ Delete_Player -------------------
// ----------------------------------------------------
const deletePlayerDetails = catchAsyncErrors(async (req, res, next) => {
  const { player_id } = req.params;
  try {
    const deletePlayerDetails = await prisma.players.delete({
      where: {
        id: Number(player_id),
      },
    });

    res.status(200).json({
      deletePlayerDetails: deletePlayerDetails,
      success: true,
      message: "Player deleted",
    });
  } catch (error) {
    next(error);
  }
});


// ----------------------------------------------------
// ------------------ Upload_logo -------------------
// ----------------------------------------------------
async function uploadLogo(files, photo) {
  if (!files || !files.logo) {
    return photo.length <= 2 ? DefaultplayerImage : photo;
  }

  try {
    if (photo && photo != DefaultplayerImage) {
      await deleteImage(photo);
    }
    return await uploadImage(files.logo, "player_image");
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = {
  playerRegistration,
  allPlayers,
  onePlayerDetailsbyId,
  onePlayerDetailsbyNumber,
  updatePlayerDetails,
  deletePlayerDetails,
};

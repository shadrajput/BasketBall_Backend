const catchAsyncErrors = require("../../middlewares/catchAsyncErrors")
const { PrismaClient } = require('@prisma/client');
const ErrorHandler = require("../../utils/ErrorHandler");
const ImageKit = require("imagekit");
const formidable = require("formidable");
const fs = require("fs");

const prisma = new PrismaClient();

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});


// ----------------------------------------------------
// ------------------ Registration --------------------
// ----------------------------------------------------
const playerRegistration = catchAsyncErrors(async (req, res, next) => {

    const form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }

        let photo = "";

        const myPromise = new Promise(async (resolve, reject) => {
            if (files.photo.originalFilename != "" && files.photo.size != 0) {
                const ext = files.photo.mimetype.split("/")[1].trim();

                if (files.photo.size >= 2000000) {
                    // 2000000(bytes) = 2MB
                    return next(new ErrorHandler('Photo size should be less than 2MB', 400));
                }
                if (ext != "png" && ext != "jpg" && ext != "jpeg") {
                    return next(new ErrorHandler("Only JPG, JPEG or PNG photo is allowed", 400));
                }

                var oldPath = files.photo.filepath;
                var fileName = Date.now() + "_" + files.photo.originalFilename;

                fs.readFile(oldPath, function (err, data) {
                    if (err) {
                        return next(new ErrorHandler(error.message, 500));
                    }
                    imagekit.upload({
                        file: data,
                        fileName: fileName,
                        overwriteFile: true,
                        folder: '/player_images'
                    }, function (error, result) {
                        if (error) {
                            return next(new ErrorHandler(error.message, 500));
                        }
                        photo = result.url
                        resolve();
                    });
                });
            }
            else {
                resolve()
            }
        })

        myPromise.then(async () => {

            let { user_id = 1, first_name, middle_name, last_name, alternate_mobile, gender, height, weight, pincode, city, state, country, playing_position, jersey_no, about } = fields

            console.log(fields)
            await prisma.players.create({
                data: {
                    user_id: user_id,
                    photo: photo,
                    first_name,
                    middle_name,
                    last_name,
                    alternate_mobile,
                    gender,
                    height: Number(height),
                    weight: Number(weight),
                    pincode: Number(pincode),
                    city,
                    state,
                    country,
                    playing_position,
                    jersey_no: Number(jersey_no),
                    about
                }
            })

            res.status(201).json({ success: true, message: "Registration successfull." })
        })

    });

})



// ----------------------------------------------------
// -------------------- all_Player --------------------
// ----------------------------------------------------
const allPlayers = catchAsyncErrors(async (req, res, next) => {

    const AllPlayer = await prisma.players.findMany()

    res.status(200).json({
        AllPlayer: AllPlayer,
        success: true,
        message: "All Player"
    })
})


// ----------------------------------------------------
// -------------- one_Player_Details ------------------
// ----------------------------------------------------
const onePlayerDetails = catchAsyncErrors(async (req, res, next) => {

    const { player_id } = req.params

    const onePlayerDetails = await prisma.players.findFirst({
        where: {
            id: Number(player_id)
        }
    })

    res.status(200).json({
        onePlayerDetails: onePlayerDetails,
        success: true,
        message: "One Player Details"
    })
})


// ----------------------------------------------------
// ------------------ Update_Player -------------------
// ----------------------------------------------------
const updatePlayerDetails = catchAsyncErrors(async (req, res, next) => {
    const { player_id } = req.params

    const { first_name, middle_name, last_name, alternate_mobile, gender, height, weight, pincode, city, state, country, playing_position, jersey_no, about } = req.body

    await prisma.players.update({
        where: {
            id: Number(player_id)
        },
        data: {
            first_name,
            middle_name,
            last_name,
            alternate_mobile,
            gender,
            height,
            weight,
            pincode,
            city,
            state,
            country,
            playing_position,
            jersey_no,
            about
        }
    })

    res.status(200).json({ success: true, message: "Player details updated" })
})


// ----------------------------------------------------
// ------------------ Delete_Player -------------------
// ----------------------------------------------------
const deletePlayerDetails = catchAsyncErrors(async (req, res, next) => {

    const { player_id } = req.params
    await prisma.players.delete({
        where: {
            id: Number(player_id)
        }
    })

    res.status(200).json({ success: true, message: "Player details deleted" })
})




module.exports = {
    playerRegistration,
    allPlayers,
    onePlayerDetails,
    updatePlayerDetails,
    deletePlayerDetails
}
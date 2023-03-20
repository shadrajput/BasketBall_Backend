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
// --------------------- Add --------------------------
// ----------------------------------------------------
const addgallery = catchAsyncErrors(async (req, res, next) => {

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
                        return next(new ErrorHandler(err.message, 500));
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

            let { tournament_id, category, priority, created_at } = fields
            await prisma.gallery.create({
                data: {
                    tournament_id: tournament_id,
                    photo: photo,
                    category: category,
                    priority: priority,
                    created_at: created_at
                }
            })

            res.status(201).json({ success: true, message: "Gallery added successfull." })
        })

    });

})



// ----------------------------------------------------
// -------------------- all_gallery --------------------
// ----------------------------------------------------
const allGellery = catchAsyncErrors(async (req, res, next) => {

    const allGellery = await prisma.gallery.findMany()

    res.status(200).json({
        AllNews: allGellery,
        success: true,
        message: "All Gallery"
    })
})


// ----------------------------------------------------
// -------------- one_News_Details ------------------
// ----------------------------------------------------
const oneGalleryDetails = catchAsyncErrors(async (req, res, next) => {

    const { id } = req.params

    const oneGalleryDetails = await prisma.gallery.findFirst({
        where: {
            id: Number(id)
        }
    })
    res.status(200).json({
        oneGalleryDetails: oneGalleryDetails,
        success: true,
        message: "One News Details"
    })
})


// ----------------------------------------------------
// ------------------ Update_Gallery -------------------
// ----------------------------------------------------
const updateGalleryDetails = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params

    let { category, priority, created_at } = req.body

    const updateGalleryDetails = await prisma.gallery.update({
        where: {
            id: Number(id)
        },
        data: {
            category: category,
            priority: priority,
            created_at: created_at
        }
    })

    res.status(200).json({ updateGalleryDetails: updateGalleryDetails, success: true, message: "Gallery details updated" })
})


// ----------------------------------------------------
// ------------------ Delete_Gallery -------------------
// ----------------------------------------------------
const deleteGalleryDetails = catchAsyncErrors(async (req, res, next) => {

    const { id } = req.params
  const deleteGalleryDetails =  await prisma.gallery.delete({
        where: {
            id: Number(id)
        }
    })

    res.status(200).json({
        deleteGalleryDetails : deleteGalleryDetails ,
         success: true,
        message: "News details deleted"
    })
})




module.exports = {
    addgallery,
    allGellery,
    oneGalleryDetails,
    updateGalleryDetails,
    deleteGalleryDetails
}
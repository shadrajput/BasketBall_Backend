const catchAsyncErrors = require("../../middlewares/catchAsyncErrors")
const { PrismaClient } = require('@prisma/client');
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
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});


// ----------------------------------------------------
// --------------------- Add --------------------------
// ----------------------------------------------------
const addgallery = catchAsyncErrors(async (req, res, next) => {

    const form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {

        const GalleryInfo = JSON.parse(fields?.data);
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }

        let photo = "";
        photo = await uploadLogo(files, photo);
        const data = await prisma.gallery.create({
            data: {
                photo: photo,
                category: GalleryInfo.GalleryInfo.category,
            },
        });

        res.status(200).json({
            data: data,
            success: true,
            message: "Gallery Add Success"
        })

    });

})



// ----------------------------------------------------
// -------------------- all_gallery --------------------
// ----------------------------------------------------
const allGellery = catchAsyncErrors(async (req, res, next) => {
    let { page } = req.params;

    const allGellery = await prisma.gallery.findMany({
        skip: page * 10,
        take: 10,
    })

    res.status(200).json({
        data: allGellery,
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

// ----------------------------------------------------
// ------------------ Upload_image -------------------
// ----------------------------------------------------
async function uploadLogo(files, photo) {
    try {
        return await uploadImage(files.photo, "player_image");
    } catch (error) {
        throw new Error(error.message);
    }
}




module.exports = {
    addgallery,
    allGellery,
    oneGalleryDetails,
    updateGalleryDetails,
    deleteGalleryDetails
}
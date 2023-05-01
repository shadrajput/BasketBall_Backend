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
        photo = await uploadLogo(files);
        const data = await prisma.gallery.create({
            data: {
                photo: photo,
                category: GalleryInfo.GalleryInfo.category,
            },
        });

        res.status(200).json({
            data: data,
            success: true,
            message: "Gallery image uploaded successfully"
        })

    });

})



// ----------------------------------------------------
// -------------------- all_gallery --------------------
// ----------------------------------------------------
const adminGallery = catchAsyncErrors(async (req, res, next) => {
    let { page } = req.params;
    const itemsPerPage = 10
    
    const allImages = await prisma.gallery.findMany({
        skip: page * itemsPerPage,
        take: itemsPerPage,
    })

    const totalImages = await prisma.gallery.count()

    res.status(200).json({
        data: allImages,
        pageCount: Math.ceil(totalImages / itemsPerPage),
        success: true,
    })
})

const allGallery =  catchAsyncErrors(async (req, res, next) => {
    let { page, category } = req.params;
    const itemsPerPage = 10
    
    const allImages = await prisma.gallery.findMany({
        where:{
            category: category == 'all' ? undefined : category
        },
        skip: page * itemsPerPage,
        take: itemsPerPage,
    })

    const totalImages = await prisma.gallery.count({
        where:{
            category: category == 'all' ? undefined : category
        }
    })

    res.status(200).json({
        data: allImages,
        pageCount: Math.ceil(totalImages / itemsPerPage),
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

    const galleryDetails = await prisma.gallery.delete({
        where:{
        id: Number(id),
        }
    })

    await deleteImage(galleryDetails.photo)

    res.status(200).json({success: true, message: 'Gallery Image deleted successfully'})
})

// ----------------------------------------------------
// ------------------ Upload_image -------------------
// ----------------------------------------------------
async function uploadLogo(files) {
    try {
        return await uploadImage(files.photo, "gallery");
    } catch (error) {
        throw new Error(error.message);
    }
}


module.exports = {
    addgallery,
    allGallery,
    adminGallery,
    oneGalleryDetails,
    updateGalleryDetails,
    deleteGalleryDetails
}
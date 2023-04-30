const catchAsyncErrors = require("../../middlewares/catchAsyncErrors")
const { PrismaClient } = require('@prisma/client');
const ErrorHandler = require("../../utils/ErrorHandler");
const ImageKit = require("imagekit");
const formidable = require("formidable");
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
const addnews = catchAsyncErrors(async (req, res, next) => {

    const form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
        try {

            const NewsInfo = JSON.parse(fields?.data);
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
            let photo = "";
            photo = await uploadLogo(files, photo);
            const data = await prisma.news.create({
                data: {
                    photo: photo,
                    title: NewsInfo.NewsInfo.title,
                    description: NewsInfo.NewsInfo.description,
                    tags: NewsInfo.NewsInfo.tags
                },
            });

            res.status(201).json({
                data: data,
                success: true,
                message: "News added successfully",
            });
        } catch (error) {
            next(error)
        }

    });

})

// ----------------------------------------------------
// -------------------- all_news --------------------
// ----------------------------------------------------
const allNews = catchAsyncErrors(async (req, res, next) => {
    let { page } = req.params;
    const itemsPerPage = 12

    const AllNews = await prisma.news.findMany({
        skip: page * itemsPerPage,
        take: itemsPerPage,
    })

    const totalNews = await prisma.news.count();

    res.status(200).json({
        AllNews: AllNews,
        pageCount: Math.ceil(totalNews / itemsPerPage),
        success: true,
        message: "All News"
    })
})


// ----------------------------------------------------
// -------------- one_News_Details ------------------
// ----------------------------------------------------
const oneNewsDetails = catchAsyncErrors(async (req, res, next) => {

    const { id } = req.params

    const oneNewsDetails = await prisma.news.findFirst({
        where: {
            id: Number(id)
        }
    })

    res.status(200).json({
        oneNewsDetails: oneNewsDetails,
        success: true,
        message: "One News Details"
    })
})


// ----------------------------------------------------
// ------------------ Update_News -------------------
// ----------------------------------------------------
const updateNewsDetails = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params

    const { title, description, created_at } = req.body

    const updateNewsDetails = await prisma.news.update({
        where: {
            id: Number(id)
        },
        data: {
            title: title,
            description: description,
            created_at: created_at
        }
    })

    res.status(200).json({
        updateNewsDetails: updateNewsDetails,
        success: true,
        message: "News details updated"
    })
})


// ----------------------------------------------------
// ------------------ Delete_News -------------------
// ----------------------------------------------------
const deleteNewsDetails = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params
    const newsDetails = await prisma.news.delete({
        where: {
            id: Number(id)
        }
    })

    await deleteImage(newsDetails.photo)

    res.status(200).json({
        success: true,
        message: "News deleted successfully"
    })

})


// ----------------------------------------------------
// ------------------ Upload_image -------------------
// ----------------------------------------------------
async function uploadLogo(files) {
    try {
        return await uploadImage(files.photo, "news");
    } catch (error) {
        throw new Error(error.message);
    }
}



module.exports = {
    addnews,
    allNews,
    oneNewsDetails,
    updateNewsDetails,
    deleteNewsDetails
}
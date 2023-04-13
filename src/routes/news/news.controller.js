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
        console.log(fields)
        try {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
    
            let photo = "";
            photo = await uploadLogo(files, photo);
            // const myPromise = new Promise(async (resolve, reject) => {
            //     // if (files.photo.originalFilename != "" && files.photo.size != 0) {
            //     //     const ext = files.photo.mimetype.split("/")[1].trim();
    
            //     //     if (files.photo.size >= 2000000) {
            //     //         // 2000000(bytes) = 2MB
            //     //         return next(new ErrorHandler('Photo size should be less than 2MB', 400));
            //     //     }
            //     //     if (ext != "png" && ext != "jpg" && ext != "jpeg") {
            //     //         return next(new ErrorHandler("Only JPG, JPEG or PNG photo is allowed", 400));
            //     //     }
    
            //     //     var oldPath = files.photo.filepath;
            //     //     var fileName = Date.now() + "_" + files.photo.originalFilename;
    
            //     //     fs.readFile(oldPath, function (err, data) {
            //     //         if (err) {
            //     //             return next(new ErrorHandler(err.message, 500));
            //     //         }
            //     //         imagekit.upload({
            //     //             file: data,
            //     //             fileName: fileName,
            //     //             overwriteFile: true,
            //     //             folder: '/player_images'
            //     //         }, function (error, result) {
            //     //             if (error) {
            //     //                 return next(new ErrorHandler(error.message, 500));
            //     //             }
            //     //             photo = result.url
            //     //             resolve();
            //     //         });
            //     //     });
            //     // }
            //     // else {
            //     //     resolve()
            //     // }
    
            // })
            const data = await prisma.news.create({
                data: {
                    photo: photo,
                    title: title,
                    description: description,
                    created_at: created_at
                }
            }) 
        } catch (error) {
                console.log(error)
        }


        // myPromise.then(async () => {

        //     let { title, description, created_at } = fields


        //     res.status(201).json({ success: true, message: "News added successfull." })
        // })

    });

})



// ----------------------------------------------------
// -------------------- all_news --------------------
// ----------------------------------------------------
const allNews = catchAsyncErrors(async (req, res, next) => {

    const AllNews = await prisma.news.findMany()

    res.status(200).json({
        AllNews: AllNews,
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
    const deleteNewsDetails = await prisma.news.delete({
        where: {
            id: Number(id)
        }
    })

    res.status(200).json({
        deleteNewsDetails: deleteNewsDetails,
        success: true,
        message: "News details deleted"
    })
})


// ----------------------------------------------------
// ------------------ Upload_image -------------------
// ----------------------------------------------------
async function uploadLogo(files, photo) {
    // console.log(files)
    // if (!files || !files.logo) {
    //     console.log("empty ke andar to gye");
    //     return photo.length <= 2 ? DefaultplayerImage : photo;
    // }
    console.log("New Image upload kia")
    try {
        if (photo && photo != DefaultplayerImage) {
            console.log("yaha to ja raha he");
            await deleteImage(photo);
        }
        return await uploadImage(files.logo, "player_image");
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
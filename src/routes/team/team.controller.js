const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");
const formidable = require("formidable");
const ImageKit = require("imagekit");
const fs = require("fs");

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const httpTeamRegister = catchAsyncErrors(async (req, res, next) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    let logo = "";

    const myPromise = new Promise(async (resolve, reject) => {
      if (files.team_logo.originalFilename != "" && files.team_logo.size != 0) {
        const ext = files.team_logo.mimetype.split("/")[1].trim();

        if (files.team_logo.size >= 2000000) {
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

        var oldPath = files.team_logo.filepath;
        var fileName = Date.now() + "_" + files.team_logo.originalFilename;

        fs.readFile(oldPath, function (err, data) {
          if (err) {
            return next(new ErrorHandler(error.message, 500));
          }
          imagekit.upload(
            {
              file: data,
              fileName: fileName,
              overwriteFile: true,
              folder: "/team_images",
            },
            function (error, result) {
              if (error) {
                return next(new ErrorHandler(error.message, 500));
              }
              logo = result.url;
              console.log("Logo ", logo);
              resolve();
            }
          );
        });
      } else {
        resolve();
      }
    });
    console.log(files.team_logo.originalFilename);
    const TeamData = JSON.parse(fields?.data);
  });
});

module.exports = {
  httpTeamRegister,
};

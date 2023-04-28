const ImageKit = require("imagekit");
const fs = require("fs");
const ErrorHandler = require("../utils/ErrorHandler");

const DefaultteamImage =
  "https://ik.imagekit.io/uz4hsgydu/Default/basketball_team_logo_2.webp?updatedAt=1682664521906";

const DefaultplayerImage =
  "https://ik.imagekit.io/uz4hsgydu/Default/player-default-profile.webp?updatedAt=1682665010247";

const tournamentDefaultImage = 'https://ik.imagekit.io/uz4hsgydu/Default/tournament_logo_2.webp?updatedAt=1681908076262'

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});




async function uploadImage(file, folder) {
  return new Promise((resolve, reject) => {
    const ext = file.mimetype.split("/")[1].trim();

    if (file.size >= 2000000) {
      // 2000000(bytes) = 2MB
      reject(new Error("Photo size should be less than 2MB"));
    }

    if (ext !== "png" && ext !== "jpg" && ext !== "jpeg") {
      reject(new Error("Only JPG, JPEG or PNG logo is allowed"));
    }

    const oldPath = file.filepath;
    const fileName = `${Date.now()}_${file.originalFilename}`;

    fs.readFile(oldPath, (err, data) => {
      if (err) {
        reject(err);
      }

      imagekit.upload(
        {
          file: data,
          fileName,
          overwriteFile: true,
          folder: `/${folder}`,
        },
        (error, result) => {
          if (error) {
            reject(error);
          }

          resolve(result?.url);
        }
      );
    });
  });
}

const searchImage = async (name) => {
  const result = await imagekit.listFiles({
    searchQuery: `'name'="${name}"`,
  });
  if (result && result.length > 0) {
    return result[0].fileId;
  }
  return null;
};

async function deleteImage(name) {
  const image = name.split("/")[5];

  try {
    const imageID = await searchImage(image);
    if (imageID) {
      await imagekit.deleteFile(imageID);
    }
  } catch (error) {
    return new ErrorHandler("Failed to update logo", 500);
  }
}

module.exports = { uploadImage, deleteImage, DefaultteamImage, tournamentDefaultImage, DefaultplayerImage };

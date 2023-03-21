const ImageKit = require("imagekit");
const fs = require("fs"); 

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

          resolve(result.url);
        }
      );
    });
  });
}

module.exports = { uploadImage };

const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;


cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET
});

const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: "TwoExpress",
  allowedFormats: ["jpg", "png", "gif", "webp", "mp3", "mp4","ogg", "aac"],//audio and video format
  transformation: [{ width: 250, height: 250, crop: "limit" }],
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }

});

const upload = multer({storage: storage});

module.exports = upload;
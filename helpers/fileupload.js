const multer = require("multer");

/**
 * a file uploader middleware using multer and uploading into a folder
 * by name 'uploads'
 * in case u get an error here, please create a folder by name 'uploader'
 * into the root of this project
 */
exports.Uploader = (req, res, next) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });

  const upload = multer({ storage: storage });
  return upload;
};

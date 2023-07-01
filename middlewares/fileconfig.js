const multer = require('multer');

const storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },

  filename: function (req, file, cb) {
    const uniqueprefix = Date.now();
    cb(null, uniqueprefix + "-" + file.originalname);
  },
});

module.exports = storage;

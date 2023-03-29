import path from 'path';

const multer = require('multer');

const multerStorage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'assets'));
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, Math.floor(Math.random() * 1000) + Date.now() + '.' + ext);
  },
});

const multerFilter = (req, file, cb) => {
  cb(null, true);
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

module.exports = upload.single('image');

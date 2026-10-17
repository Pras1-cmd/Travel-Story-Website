const multer = require('multer');

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PROFILE_IMAGE_SIZE },
  fileFilter: (req, file, callback) => {
    if (!ALLOWED_PROFILE_IMAGE_TYPES.includes(file.mimetype)) {
      const error = new Error('Choose a JPEG, PNG, WebP, or GIF image.');
      error.statusCode = 400;
      callback(error);
      return;
    }

    callback(null, true);
  }
});

const uploadProfileImage = (req, res, next) => {
  upload.single('image')(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      const statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.code === 'LIMIT_FILE_SIZE'
          ? 'Profile images must be 5 MB or smaller.'
          : 'Invalid profile image upload.'
      });
      return;
    }

    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Invalid profile image upload.'
    });
  });
};

module.exports = uploadProfileImage;

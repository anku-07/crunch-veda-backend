const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB Limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed!'), false);
    }
  },
});

// POST /api/upload - Admin Only upload endpoint
router.post(
  '/',
  protect,
  adminOnly,
  upload.single('image'),
  uploadController.uploadImage
);

module.exports = router;

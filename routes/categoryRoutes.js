const express = require('express');
const multer = require('multer');
const categoryController = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

// Multer storage configuration for parsing file fields
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed!'), false);
    }
  },
});

// --- PUBLIC ROUTES ---
router.get('/', categoryController.getCategories);

// --- PROTECTED ADMIN ROUTES ---
router.post('/', protect, adminOnly, upload.single('image'), categoryController.createCategory);
router.put('/:id', protect, adminOnly, upload.single('image'), categoryController.updateCategory);
router.delete('/:id', protect, adminOnly, categoryController.deleteCategory);

module.exports = router;


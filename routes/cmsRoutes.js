const express = require('express');
const multer = require('multer');
const cmsController = require('../controllers/cmsController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

// Multer storage configuration for parsing file fields
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// --- PUBLIC ROUTES ---
router.get('/', cmsController.getCMSData);
router.get('/home-page', cmsController.getHomepageCMS);

// --- PROTECTED ADMIN ROUTES ---
router.put('/', protect, adminOnly, cmsController.updateCMSData);
router.put('/home-banner', protect, adminOnly, upload.single('image'), cmsController.updateHomeBanner);
router.put('/category-section', protect, adminOnly, cmsController.updateCategorySection);
router.put('/best-seller', protect, adminOnly, cmsController.updateBestSeller);

module.exports = router;

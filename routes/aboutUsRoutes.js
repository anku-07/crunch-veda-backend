const express = require('express');
const multer = require('multer');
const aboutUsController = require('../controllers/aboutUsController');
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
router.get('/', aboutUsController.getAboutUsPage);
router.get('/banner', aboutUsController.getBanner);
router.get('/stewardship', aboutUsController.getStewardship);
router.get('/journey', aboutUsController.getJourney);
router.get('/quote', aboutUsController.getQuote);
router.get('/charter', aboutUsController.getCharter);

// --- PROTECTED ADMIN ROUTES ---
router.put('/banner', protect, adminOnly, upload.single('image'), aboutUsController.updateBanner);
router.put('/stewardship', protect, adminOnly, upload.single('image'), aboutUsController.updateStewardship);
router.put('/journey', protect, adminOnly, upload.none(), aboutUsController.updateJourney);
router.put('/quote', protect, adminOnly, upload.none(), aboutUsController.updateQuote);
router.put('/charter', protect, adminOnly, upload.none(), aboutUsController.updateCharter);

module.exports = router;

const express = require('express');
const multer = require('multer');
const ourStoryController = require('../controllers/ourStoryController');
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
router.get('/', ourStoryController.getOurStoryPage);
router.get('/banner', ourStoryController.getBanner);
router.get('/the-beginning', ourStoryController.getTheBeginning);
router.get('/philosophy', ourStoryController.getPhilosophy);
router.get('/stewardship', ourStoryController.getStewardship);

// --- PROTECTED ADMIN ROUTES ---
router.put('/banner', protect, adminOnly, upload.single('image'), ourStoryController.updateBanner);
router.put('/the-beginning', protect, adminOnly, upload.single('image'), ourStoryController.updateTheBeginning);
router.put('/philosophy', protect, adminOnly, upload.none(), ourStoryController.updatePhilosophy);
router.put('/stewardship', protect, adminOnly, upload.any(), ourStoryController.updateStewardship);

module.exports = router;

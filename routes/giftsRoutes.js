const express = require("express");
const multer = require("multer");
const giftsController = require("../controllers/giftsController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

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
router.get("/", giftsController.getGiftsPage);

// --- PROTECTED ADMIN ROUTES ---
router.put("/banner", protect, adminOnly, giftsController.updateBanner);
router.put(
  "/gift-collections",
  protect,
  adminOnly,
  upload.any(),
  giftsController.updateGiftCollections,
);
router.put(
  "/custom-chest",
  protect,
  adminOnly,
  upload.single("image"),
  giftsController.updateCustomChest,
);
router.put(
  "/gift-products",
  protect,
  adminOnly,
  upload.any(),
  giftsController.updateGiftProducts,
);

module.exports = router;

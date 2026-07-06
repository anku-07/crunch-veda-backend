const express = require("express");
const multer = require("multer");
const productController = require("../controllers/productController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images are allowed!"), false);
    }
  },
});

// --- PUBLIC ROUTES ---
// Available to any customer browsing the website
router.get("/", productController.getAllProducts);
router.get("/categories", productController.getProductCategories);
router.get("/:id", productController.getProductById);

// --- PROTECTED ADMIN ROUTES ---
// You must be logged in AND have an 'admin' role to write/update/delete products
router.post(
  "/",
  protect,
  adminOnly,
  upload.array("images", 10),
  productController.createProduct,
);
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.array("images", 10),
  productController.updateProduct,
);
router.delete("/:id", protect, adminOnly, productController.deleteProduct);
router.post("/cart/:id", protect, productController.addToCart);
router.put("/cart/:id", protect, productController.updateCartItemQuantity);
router.delete("/cart/:id", protect, productController.removeFromCart);

module.exports = router;

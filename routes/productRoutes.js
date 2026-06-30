const express = require('express');
const productController = require('../controllers/productController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

// --- PUBLIC ROUTES ---
// Available to any customer browsing the website
router.get('/', productController.getAllProducts);
router.get('/categories', productController.getProductCategories);
router.get('/:id', productController.getProductById);

// --- PROTECTED ADMIN ROUTES ---
// You must be logged in AND have an 'admin' role to write/update/delete products
router.post('/', protect, adminOnly, productController.createProduct);
router.put('/:id', protect, adminOnly, productController.updateProduct);
router.delete('/:id', protect, adminOnly, productController.deleteProduct);

module.exports = router;

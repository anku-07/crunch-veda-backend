const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public Authentication endpoints
router.post('/register', authController.registerUser);
router.post('/login', authController.login);
router.post('/admin-login', authController.adminLogin);

// Protected endpoint to view and update logged-in profile
// "protect" runs first. If valid, authController.getProfile is executed.
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;

const express = require('express');
const userController = require('../controllers/userController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

// Restrict all routes defined below to logged-in admins only
router.use(protect, adminOnly);

router.get('/', userController.getAllUsers);
router.put('/:id/status', userController.toggleUserStatus);

module.exports = router;

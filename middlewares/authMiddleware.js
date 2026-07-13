const { verifyToken } = require('../utils/jwt');
const User = require('../models/User.model');

// Middleware to check if user is logged in
const protect = async (req, res, next) => {
  let token;

  // Read token from Bearer Authorization header (case-insensitive and handles extra whitespace)
  if (req.headers.authorization && /^bearer\s+/i.test(req.headers.authorization)) {
    token = req.headers.authorization.split(/\s+/)[1];
  }

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'You are not logged in. Please log in to get access.',
    });
  }

  try {
    // Decode token
    const decoded = verifyToken(token);

    // Find user by id stored in token
    const currentUser = await User.findById(decoded.id)
      .select('-password')
      .populate('cartItems.product');
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // Check if user is active
    if (!currentUser.isActive) {
      return res.status(401).json({
        status: 'fail',
        message: 'This user account has been deactivated.',
      });
    }

    // Attach user to the request object so future middlewares/controllers can read it
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid token. Please log in again.',
    });
  }
};

// Middleware to restrict access to admin users only
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      status: 'fail',
      message: 'Access denied. Admin permissions required.',
    });
  }
};

module.exports = {
  protect,
  adminOnly,
};

const User = require('../models/User.model');

// 1. GET ALL USERS (Admin Only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. TOGGLE USER STATUS (Admin Only)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that ID',
      });
    }

    // Admins cannot deactivate themselves to avoid lockout
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Admins cannot deactivate their own account.',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const CMS = require('../models/CMS.model');

const seedAdmin = async () => {
  try {
    // 1. Check if admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('⏳ No admin user found. Seeding default admin...');
      const hashedPassword = await bcrypt.hash('AdminPassword123', 10);
      await User.create({
        name: 'CrunchVeda Admin',
        email: 'admin@crunchveda.com',
        password: hashedPassword,
        phone: '0000000000',
        role: 'admin',
        isActive: true,
      });
      console.log('✅ Default admin seeded successfully: admin@crunchveda.com / AdminPassword123');
    } else {
      console.log('ℹ️ Admin user already exists.');
    }

    // 2. Check if CMS settings exist
    const cmsExists = await CMS.findOne({ key: 'general' });
    if (!cmsExists) {
      console.log('⏳ No default CMS settings found. Seeding default settings...');
      await CMS.create({ key: 'general' });
      console.log('✅ Default CMS settings seeded successfully.');
    } else {
      console.log('ℹ️ CMS settings already exist.');
    }
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
  }
};

module.exports = seedAdmin;

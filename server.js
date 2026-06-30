const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file before anything else
dotenv.config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT;

// Start Server Wrapper
const start = async () => {
  // 1. Connect to Database
  await connectDB();

  // 2. Start Listening to Network requests
  app.listen(PORT, () => {
    console.log(`🚀 Server is listening at http://localhost:${PORT}`);
  });
};

start();

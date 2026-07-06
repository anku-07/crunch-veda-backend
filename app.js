const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const ourStoryRoutes = require('./routes/ourStoryRoutes');
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();

// --- 1. GLOBAL MIDDLEWARES ---
app.use(cors()); // Allow requests from our frontend
app.use(express.json()); // Parse JSON request bodies (makes req.body accessible)
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Log incoming HTTP requests in development console
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// --- 2. API ENDPOINTS ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running smoothly!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/our-story', ourStoryRoutes);

// --- 3. 404 FALLBACK ROUTE ---
app.use((req, res, next) => {
  const err = new Error(`Cannot find ${req.originalUrl} on this server!`);
  err.statusCode = 404;
  next(err); // Pass error directly to the global error middleware
});

// --- 4. GLOBAL ERROR HANDLER ---
app.use(errorHandler);

module.exports = app;

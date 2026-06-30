// Global error handler middleware
// In Express, any middleware with 4 parameters is treated as an Error Handler
const errorHandler = (err, req, res, next) => {
  console.error('💥 Error Intercepted:', err.message || err);

  const statusCode = err.statusCode || 500;
  const status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

  res.status(statusCode).json({
    status: status,
    message: err.message || 'Something went wrong on our end.',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;

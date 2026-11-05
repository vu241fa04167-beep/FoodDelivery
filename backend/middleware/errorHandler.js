// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('[errorHandler]', err.stack || err.message || err);

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error'
  });
};

export default errorHandler;

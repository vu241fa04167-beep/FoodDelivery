export const notFoundHandler = (req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors)[0].message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid identifier format' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'That value is already in use' });
  }

  res.status(err.status || 500).json({
    message: err.message || 'An unexpected server error occurred'
  });
};


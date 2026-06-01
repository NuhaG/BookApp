const errorHandler = (err, req, res, next) => {
  // fallback to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Log full stack to aid debugging in host logs
  try {
    console.error(err && err.stack ? err.stack : err);
  } catch (loggingErr) {
    // ignore logging failures
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error",
  });
};

module.exports = errorHandler;

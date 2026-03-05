// wrapper for async routes and forward err
const asyncHandler = (fn) => {
  return (req, res, next) => {
    // normalize, rejected to next 
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler

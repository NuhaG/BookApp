module.exports = (req, res, next) => {
  // suimulation
  req.user = {
    id: "65e1234567890abcdef12349", // dummy uid
    name: "Test Guest",
    role: "user",
  };
  next();
};

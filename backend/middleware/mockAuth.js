// mock auth middleware
module.exports = (req, res, next) => {
  // simulation
  req.user = {
    id: "65e1234567890abcdef12349", // dummy user id
    name: "Test Guest",
    role: "user",
  };
  next();
};

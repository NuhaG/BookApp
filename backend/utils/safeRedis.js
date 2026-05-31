const redisClient = require("./redisClient");

// Safe wrapper so Redis NEVER crashes API
const safeRedis = {
  async get(key) {
    try {
      return await redisClient.get(key);
    } catch (err) {
      console.log("Redis GET failed:", err.message);
      return null;
    }
  },

  async set(key, value, options) {
    try {
      return await redisClient.set(key, value, options);
    } catch (err) {
      console.log("Redis SET failed:", err.message);
    }
  },

  async del(key) {
    try {
      return await redisClient.del(key);
    } catch (err) {
      console.log("Redis DEL failed:", err.message);
    }
  },

  async incr(key) {
    try {
      return await redisClient.incr(key);
    } catch (err) {
      console.log("Redis INCR failed:", err.message);
    }
  },
};

module.exports = safeRedis;
const bcrypt = require("bcrypt");

// Password hashing:
// - New hashes: bcrypt ($2a/$2b/$2y prefix)
// - Legacy hashes are NOT supported
const BCRYPT_ROUNDS = 12;

function isBcryptHash(stored) {
  const raw = String(stored || "");
  return raw.startsWith("$2a$") || raw.startsWith("$2b$") || raw.startsWith("$2y$");
}

async function hashPassword(plainPassword) {
  const password = String(plainPassword || "");
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function verifyPassword(plainPassword, stored) {
  const password = String(plainPassword || "");
  const raw = String(stored || "");

  if (!isBcryptHash(raw)) return false;
  return bcrypt.compare(password, raw);
}

module.exports = { hashPassword, verifyPassword, isBcryptHash };

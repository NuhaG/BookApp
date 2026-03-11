const mongoose = require("mongoose");
const {
  hashPassword,
  verifyPassword,
  isBcryptHash,
} = require("../utils/password");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User must have a name"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "User must have an email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "User must have a password"],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const raw = String(this.password || "");
  if (isBcryptHash(raw)) return;

  this.password = await hashPassword(raw);
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return verifyPassword(candidatePassword, userPassword);
};

module.exports = mongoose.model("User", userSchema);

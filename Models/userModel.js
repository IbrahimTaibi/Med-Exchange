const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please enter a username"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Please enter your e-mail"],
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  cin: {
    type: Number,
    required: [true, "Please enter a CIN"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    validate: [validator.isStrongPassword],
    select: false,
  },
  passwordConfirmation: {
    type: String,
    required: [true, "Please Confirm your password"],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "The confirmation password is not identical",
    },
  },
  resetPasswordToken: String,
  resetPasswordTokenExpires: String,
  passwordChangedAt: Date,
  dateOfBirth: {
    type: Date,
    required: [true, "Please enter a Date of birth"],
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  photo: String,
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Encrypt
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirmation = undefined;
  next();
});

userSchema.methods.comparePwdToDb = async (pwd, pwdDb) => {
  return await bcrypt.compare(pwd, pwdDb);
};

userSchema.methods.isPasswordChanged = async function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const passwordChangedAtTS = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return passwordChangedAtTS >= JWTTimeStamp ? true : false;
  }
  return false;
};

userSchema.methods.createResetPasswordToken = async function () {
  // Generate a reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the reset token and set it to the user's resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set the token expiration time
  this.resetPasswordTokenExpires = Date.now() + 10 * 60 * 1000;

  // Log the tokens for debugging
  console.log("Reset Token:", resetToken);
  console.log("Hashed Reset Token:", this.resetPasswordToken);

  // Return the original reset token
  return resetToken;
};
const User = mongoose.model("User", userSchema);

module.exports = User;

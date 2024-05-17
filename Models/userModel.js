const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

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

const User = mongoose.model("User", userSchema);

module.exports = User;

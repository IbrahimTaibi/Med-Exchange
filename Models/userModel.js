const mongoose = require("mongoose");
const validator = require("validator");
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
    validator: [validator.isEmail, "Please enter a valid email"],
  },
  cin: {
    type: Number,
    required: [true, "Please enter a CIN"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    validator: [validator.isStrongPassword],
  },
  passwordConfirmation: {
    type: String,
    required: [true, "Please Confirm your password"],
  },
  dateOfBirth: {
    type: Date,
    required: [true, "Please enter a Date of birth"],
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

const User = mongoose.model("User", userSchema);

module.exports = User;

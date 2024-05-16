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

userSchema.pre("save", (next) => {
  console.log("hashing...");
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;

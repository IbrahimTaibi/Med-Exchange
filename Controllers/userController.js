const asyncErrorHandler = require("../Utils/asyncErrorHandler");
const User = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const GlobalError = require("../Utils/ErrorClass");

// Field that the user allowed to update function
const allowedFields = (obj, ...fields) => {
  const newObj = {};
  Object.keys(obj).forEach((prop) => {
    if (fields.includes(prop)) {
      newObj[prop] = obj[prop];
    }
  });
  return newObj;
};

// To module this up later
// Function to generate authentication token
const authToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_STR, {
    expiresIn: process.env.EXPIRE_TOKEN_IN,
  });
};

const createResponse = (user, statusCode, res) => {
  // Generate authentication token for the new user
  const token = authToken(user._id);
  res.status(statusCode).json({
    status: "succes", // Typo here, should be "success"
    token,
    data: {
      user,
    },
  });
};
//----------------------------------------------------------------

exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.comparePwdToDb(req.body.currentPassword, user.password))) {
    const error = new GlobalError(
      "Please enter the valid current password",
      400,
    );
    next(error);
  }

  user.password = req.body.password;
  user.passwordConfirmation = req.body.passwordConfirmation;
  await user.save();

  createResponse(user, 200, res);
});

//Update The users infos => By the current user

exports.updateUserInfo = asyncErrorHandler(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirmation) {
    const error = new GlobalError(
      "You cannot update your password from this endpoint",
      400,
    );
    return next(error);
  }

  const fieldsToUpdate = allowedFields(
    req.body,
    "email",
    "name",
    "username",
    "dateOfBirth",
    "photo",
  );
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    fieldsToUpdate,
    {
      runValidators: true,
      new: true,
    },
  );

  createResponse(updatedUser, 200, res);
});

exports.deleteMe = asyncErrorHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

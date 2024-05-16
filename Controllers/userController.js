const asyncErrorHandler = require("../Utils/asyncErrorHandler");
const User = require("../Models/userModel");
const MedexFeatures = require("./../Utils/medexFeatures");
const GlobalError = require("../Utils/ErrorClass");

exports.getUsers = asyncErrorHandler(async (req, res, next) => {
  const Features = new MedexFeatures(User.find(), req.query)
    .filter()
    .sort()
    .fields()
    .paginate();
  const user = await Features.query; // i must not forget the await ...
  //Send Result
  res.status(200).json({
    status: "success",
    count: user.length,
    user,
  });
});

exports.signUp = asyncErrorHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(201).json({
    status: "succes",
    user,
  });
});

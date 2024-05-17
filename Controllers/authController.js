const asyncErrorHandler = require("../Utils/asyncErrorHandler");
const User = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const GlobalError = require("../Utils/ErrorClass");
const util = require("util");

const authToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_STR, {
    expiresIn: process.env.EXPIRE_TOKEN_IN,
  });
};

exports.signUp = asyncErrorHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  const token = authToken(user._id);

  res.status(201).json({
    status: "succes",
    token,
    data: {
      user,
    },
  });
});

exports.login = asyncErrorHandler(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    const error = new GlobalError(
      `Please enter an e-mail & a password to access to your account`,
      400,
    );
    next(error);
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    const error = new GlobalError(`Wrong email or password`, 400);
    next(error);
  }

  const isMatch = await user.comparePwdToDb(password, user.password);

  if (!isMatch) {
    const error = new GlobalError(`Wrong password`, 400);
    return next(error);
  }
  const token = authToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});

exports.isAuthenticated = asyncErrorHandler(async (req, res, next) => {
  // Get the token from the header
  const testToken = req.headers.authorization;
  let token;
  if (testToken && testToken.startsWith("Bearer")) {
    token = testToken.split(" ")[1];
  }

  // If the token does not exist in the header
  if (!token) {
    next(new GlobalError(`Please Log in To continue ..`, 401));
  }
  // If the token exists in the header , Verify if its a valid token
  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.SECRET_STR,
  );

  // Correspondance of the token in the db
  const authenticatedUser = await User.findById(decodedToken.id);

  //If the token does not belong to any User throw error ...
  if (!authenticatedUser)
    next(
      new GlobalError("The user with the given token does not exist  .", 401),
    );

  // if the user has changed his password
  const isPasswordChanged = await authenticatedUser.isPasswordChanged(
    decodedToken.iat,
  );
  if (isPasswordChanged) {
    next(
      new GlobalError(
        "The password has changed recently , Please Login again",
        401,
      ),
    );
  }
  req.user = authenticatedUser; //To pass the logged in user to the next middleware
  next();
});

exports.isAuthorized = (role) => {
  return (req, res, next) => {
    if (req.user.role === role) next();
    else
      next(new GlobalError("You are not allowed to perform such action", 403));
  };
};

//==============================================================>
//==============================================================>
/* exports.getUsers = asyncErrorHandler(async (req, res, next) => {
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
}); */

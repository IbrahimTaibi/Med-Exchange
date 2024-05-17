const asyncErrorHandler = require("../Utils/asyncErrorHandler");
const User = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const GlobalError = require("../Utils/ErrorClass");
const util = require("util");

// Function to generate authentication token
const authToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_STR, {
    expiresIn: process.env.EXPIRE_TOKEN_IN,
  });
};

// Sign up route
exports.signUp = asyncErrorHandler(async (req, res, next) => {
  // Create a new user based on request body
  const user = await User.create(req.body);

  // Generate authentication token for the new user
  const token = authToken(user._id);

  // Respond with success status, token, and user data
  res.status(201).json({
    status: "succes", // Typo here, should be "success"
    token,
    data: {
      user,
    },
  });
});

// Login route
exports.login = asyncErrorHandler(async (req, res, next) => {
  // Extract email and password from request body
  const email = req.body.email;
  const password = req.body.password;

  // Check if email and password are provided
  if (!email || !password) {
    const error = new GlobalError(
      `Please enter an e-mail & a password to access to your account`,
      400,
    );
    return next(error);
  }

  // Find user by email in the database
  const user = await User.findOne({ email }).select("+password");

  // If no user found with the provided email, return an error
  if (!user) {
    const error = new GlobalError(`Wrong email or password`, 400);
    return next(error);
  }

  // Compare provided password with the password stored in the database
  const isMatch = await user.comparePwdToDb(password, user.password);

  // If passwords do not match, return an error
  if (!isMatch) {
    const error = new GlobalError(`Wrong password`, 400);
    return next(error);
  }

  // Generate authentication token for the logged-in user
  const token = authToken(user._id);

  // Respond with success status and token
  res.status(200).json({
    status: "success",
    token,
  });
});

// Middleware to check if a user is authenticated
exports.isAuthenticated = asyncErrorHandler(async (req, res, next) => {
  // Get the token from the authorization header
  const testToken = req.headers.authorization;
  let token;

  // Check if the token is provided and starts with "Bearer"
  if (testToken && testToken.startsWith("Bearer")) {
    token = testToken.split(" ")[1]; // Extract the token from the header
  }

  // If no token is found in the header, return an error
  if (!token) {
    return next(new GlobalError(`Please Log in To continue ..`, 401));
  }

  // Verify the token's validity using the secret key
  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.SECRET_STR,
  );

  // Find the user associated with the token in the database
  const authenticatedUser = await User.findById(decodedToken.id);

  // If no user is found with the given token, return an error
  if (!authenticatedUser) {
    return next(
      new GlobalError("The user with the given token does not exist  .", 401),
    );
  }

  // Check if the user's password has changed after the token was issued
  const isPasswordChanged = await authenticatedUser.isPasswordChanged(
    decodedToken.iat,
  );
  if (isPasswordChanged) {
    return next(
      new GlobalError(
        "The password has changed recently , Please Login again",
        401,
      ),
    );
  }

  // Attach the authenticated user to the request object
  req.user = authenticatedUser;
  next(); // Proceed to the next middleware
});

// Middleware to check if a user is authorized to perform an action
exports.isAuthorized = (role) => {
  return (req, res, next) => {
    // Check if the user's role matches the required role
    if (req.user.role === role) {
      next(); // User is authorized, proceed to the next middleware
    } else {
      // User is not authorized, return an error
      next(new GlobalError("You are not allowed to perform such action", 403));
    }
  };
};

// Forgot Password Controller
exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
  // Find the user by the provided email address
  const user = await User.findOne({ email: req.body.email });

  // If the user does not exist, create an error and pass it to the next middleware
  if (!user) {
    const error = new GlobalError("The email you provided does not exist", 400);
    return next(error); // Ensure the function exits here by using 'return'
  }

  // Create a reset password token for the user
  const resetToken = user.createResetPasswordToken();

  // Save the user to persist the reset token and its expiration time in the database
  await user.save({ validateBeforeSave: false }); // Use validateBeforeSave: false to skip validation

  // Send the resetToken to the user via email

  // Send a response back to the client
  res.status(200).json({
    status: "success",
    message: "Token sent to email!",
  });
});

exports.resetPassword = asyncErrorHandler(async (req, res, next) => {});
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

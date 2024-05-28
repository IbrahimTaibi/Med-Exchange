const asyncErrorHandler = require("../Utils/asyncErrorHandler");
const User = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const GlobalError = require("../Utils/ErrorClass");
const util = require("util");
const sendEmail = require("./../Utils/email");
const crypto = require("crypto");

// Function to generate authentication token
const authToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_STR, {
    expiresIn: process.env.EXPIRE_TOKEN_IN,
  });
};

const createResponse = (user, statusCode, res) => {
  // Generate authentication token for the new user
  const token = authToken(user._id);

  const options = {
    maxAge: process.env.EXPIRE_TOKEN_IN,
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  user.password = undefined;
  res.cookie("jwt", token, options);

  res.status(statusCode).json({
    status: "succes", // Typo here, should be "success"
    token,
    data: {
      user,
    },
  });
};

// Sign up route
exports.signUp = asyncErrorHandler(async (req, res, next) => {
  // Create a new user based on request body
  const user = await User.create(req.body);

  // Respond with success status, token, and user data
  createResponse(user, 200, res);
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
  // sending the response
  createResponse(user, 200, res);
});

// Middleware to check if a user is authenticated
exports.isAuthenticated = asyncErrorHandler(async (req, res, next) => {
  // Get the token from the authorization header
  const currentToken = req.headers.authorization;
  let token;

  // Check if the token is provided and starts with "Bearer"
  if (currentToken && currentToken.startsWith("Bearer")) {
    token = currentToken.split(" ")[1]; // Extract the token from the header
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
  console.log(Date.now());
  // If the user does not exist, create an error and pass it to the next middleware
  if (!user) {
    const error = new GlobalError("The email you provided does not exist", 400);
    return next(error); // Ensure the function exits here by using 'return'
  }

  // Create a reset password token for the user
  const resetToken = await user.createResetPasswordToken();

  // Save the user to persist the reset token and its expiration time in the database
  await user.save({ validateBeforeSave: false }); // Use validateBeforeSave: false to skip validation

  // Send the resetToken to the user via email

  // Construct the reset URL using the request protocol and host
  const resetUrl = `${req.protocol}://${req.get(
    "host",
  )}/api/v2/resetPassword/${resetToken}`;

  // Compose the email message with the reset URL
  const message = `Hello there ${user.userName}, \n we have received your reset password request.\nPlease click on the link below to reset your password:\n\n ${resetUrl} .\n \n PS: This reset password link will be available only for 10 minutes.`;

  try {
    // Send the email containing the reset token link
    await sendEmail({
      email: user.email,
      subject: `Reset password link`,
      message: message,
    });
  } catch (err) {
    // If an error occurs while sending the email, handle it
    // Clear the reset token and its expiration time from the user document
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Pass the error to the next middleware
    return next(
      new GlobalError(
        "An error occurred while sending the reset password token.",
        500,
      ),
    );
  }

  // Send a response back to the client
  createResponse(user, 200, res);
});

exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
  const resetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({ resetPasswordToken: resetToken });

  if (!user) {
    const error = new GlobalError(
      `You've entered a wrong url to reset the password , Make sure to enter the correct one `,
      400,
    );
    next(error);
  }

  if (user.resetPasswordTokenExpires < Date.now()) {
    const error = new GlobalError(
      `Your reset link has been expired try again `,
      400,
    );
    next(error);
  }

  user.password = req.body.password;
  user.passwordConfirmation = req.body.passwordConfirmation;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpires = undefined;
  user.updatedAt = Date.now();

  await user.save();

  // Respond with success status, token, and user data
  createResponse(user, 200, res);
});

exports.validateToken = asyncErrorHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ status: "fail", message: "No token provided" });
  }

  try {
    const decodedToken = await util.promisify(jwt.verify)(
      token,
      process.env.SECRET_STR,
    );
    const user = await User.findById(decodedToken.id);

    if (!user) {
      return res.status(401).json({ status: "fail", message: "Invalid token" });
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    res
      .status(401)
      .json({ status: "fail", message: "Token validation failed" });
  }
});
//==============================================================>

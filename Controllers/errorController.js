const GlobalError = require("../Utils/ErrorClass");

const devError = (res, error) => {
  res.status(error.statusCode).json({
    status: error.statusCode,
    message: error.message,
    stackTrace: error.stack,
    error: error,
  });
};

const duplicatedErrorHandler = (e) => {
  const msg = `the ${Object.keys(e.keyValue)} : ${
    e.keyValue.username
  } already exists in the database`;
  const error = new GlobalError(msg, 400);
  return error;
};
const validationErrorHandler = (e) => {
  const arr = Object.values(e.errors).map((val) => val.message);
  const msg = arr.join("  |  ");
  return new GlobalError(msg, 400);
};

const castErrorHandler = (e) => {
  return new GlobalError(
    `Invalid value ${e.value} for the field ${e.path}`,
    400,
  );
};

const jwtExpiredErrorHandler = (e) => {
  return new GlobalError(`Session expired , Please login again .. `, 401);
};
const WebTokenErrorHandler = (e) => {
  return new GlobalError(`Invalid Token , Please login `, 401);
};
const prodError = (res, error) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.statusCode,
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: "fail",
      message: "Something went wrong , please try again later ",
    });
  }
};

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || `error`;
  if (process.env.NODE_ENV === "development") {
    devError(res, error);
  } else if (process.env.NODE_ENV === "production") {
    if (error.code === 11000) error = duplicatedErrorHandler(error);
    if (error.name === "CastError") error = castErrorHandler(error);
    if (error.name === "ValidationError") error = validationErrorHandler(error);

    if (error.name === "TokenExpiredError")
      error = jwtExpiredErrorHandler(error);

    if (error.name === "JsonWebTokenError") error = WebTokenErrorHandler(error);

    prodError(res, error);
  }
  next();
};

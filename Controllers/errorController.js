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
  console.log(Object.keys(e.keyValue));
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
  const msg = `Invalid value ${e.value} for the field ${e.path}`;
  return new GlobalError(msg, 400);
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
    let err = { ...error };
    err.name = error.name;
    if (err.code === 11000) err = duplicatedErrorHandler(err);
    if (err.name === "CastError") err = castErrorHandler(err);
    if (err.name === "ValidationError") err = validationErrorHandler(err);
    prodError(res, err);
  }
  next();
};

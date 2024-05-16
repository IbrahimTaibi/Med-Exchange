const GlobalError = require("../Utils/ErrorClass");

const devError = (res, error) => {
  res.status(error.statusCode).json({
    status: error.statusCode,
    message: error.message,
    stackTrace: error.stack,
    error: error,
  });
};
const validationErrorHandler = (e) => {
  const msg = e.errors.name.properties.message;
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
    if (err.name === "CastError") {
      err = castErrorHandler(err);
      prodError(res, err);
    } else if (err.name === "ValidationError") {
      err = validationErrorHandler(err);
      prodError(res, err);
    }
  }
  next();
};

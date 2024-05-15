// Asynchronus Error handling
const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
    // next();
  };
};

module.exports = asyncErrorHandler;

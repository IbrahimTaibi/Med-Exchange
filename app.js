const express = require("express");
const medicationRouter = require("./Routes/medicationRoutes");
const authRouter = require("./Routes/authRoutes");
const userRouter = require("./Routes/userRoutes");
const globalErrorHandler = require("./Controllers/errorController");
const rateLimiter = require("express-rate-limit");
const medicationController = require("./Controllers/medicationController");
const morgan = require("morgan");
const dotenv = require("dotenv");

const app = express();

let limiter = rateLimiter({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message:
    "You reached the maximum amount of requests , please try again later after 1 hour",
});
app.use("/api", limiter);

dotenv.config({ path: "./config.env" });
if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}

app.use(express.json());

app.use("/api/v2/medication", medicationRouter);
app.use("/api/v2/auth", authRouter);
app.use("/api/v2/user", userRouter);

// Page not Found (wrong url)
app.all("*", medicationController.pageNotFound);

app.use(globalErrorHandler);

module.exports = app;

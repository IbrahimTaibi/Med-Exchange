const express = require("express");
const medicationRouter = require("./Routes/medicationRoutes");
const globalErrorHandler = require("./Controllers/errorController");
const medicationController = require("./Controllers/medicationController");
const morgan = require("morgan");
const dotenv = require("dotenv");
const app = express();

dotenv.config({ path: "./config.env" });
if (process.env.ENVIREMENT == "development") {
  app.use(morgan("dev"));
}

app.use(express.json());

app.use("/api/v2/medication", medicationRouter);

// Page not Found (wrong url)
app.all("*", medicationController.pageNotFound);

app.use(globalErrorHandler);

module.exports = app;

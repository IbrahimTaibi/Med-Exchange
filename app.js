const express = require("express");
const app = express();
const medicationRouter = require("./Routes/medicationRoutes");
const morgan = require("morgan");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });
if (process.env.ENVIREMENT == "development") {
  app.use(morgan("dev"));
}

app.use(express.json());

app.use("/api/v2/medication", medicationRouter);

module.exports = app;

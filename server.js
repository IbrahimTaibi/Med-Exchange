const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");

dotenv.config({ path: "./config.env" });
const url = process.env.URL;

uncaughtExecption: process.on("uncaughtException", (err) => {
  console.log(err.message);
  console.log("Uncaught exception occured , Shutting down ...");
  process.exit(1);
});

const app = require("./app");
const server = app.listen(url, () => {
  console.log("listening to " + url);
});

mongoose.connect(process.env.MONGO_DB).then(() => {
  console.log("Database connected successfully");
});

UnhandledRejection: process.on("unhandledRejection", (err) => {
  console.log(err.message);
  console.log("unhandled Rejection occured , Shutting down ...");
  server.close(() => {
    process.exit(1);
  });
});

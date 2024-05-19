const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Load environment variables from .env file
dotenv.config({ path: "./config.env" });

const app = require("./app");

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception: ", err.message);
  console.error("Shutting down due to uncaught exception...");
  process.exit(1);
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error("Database connection error: ", err.message);
    process.exit(1);
  });

// Start the server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection: ", err.message);
  console.error("Shutting down due to unhandled rejection...");
  server.close(() => {
    process.exit(1);
  });
});

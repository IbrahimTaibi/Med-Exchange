const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");

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

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket with socket.io
const io = socketIo(server);

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  // Handle chat message event
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });
});

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
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

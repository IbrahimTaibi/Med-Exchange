const express = require("express");
const medicationRouter = require("./Routes/medicationRoutes");
const authRouter = require("./Routes/authRoutes");
const userRouter = require("./Routes/userRoutes");
const chatRouter = require("./Routes/chatRoutes");
const globalErrorHandler = require("./Controllers/errorController");
const medicationController = require("./Controllers/medicationController");
const rateLimiter = require("express-rate-limit");
const sanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const morgan = require("morgan");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");

app.set("trust proxy", 2);
// Load environment variables from config.env file
dotenv.config({ path: "./config.env" });

const app = express();

app.use(cors());
// Set security-related HTTP headers
app.use(helmet());

// Rate limiting middleware to prevent DDoS attacks
let limiter = rateLimiter({
  max: 1000, // Maximum number of requests per windowMs
  windowMs: 60 * 60 * 1000, // 1 hour window
  message:
    "You reached the maximum amount of requests, please try again later after 1 hour",
});
app.use("/api", limiter); // Apply rate limiter to all API routes

// Enable detailed request logging in development mode
if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}

// Middleware to parse incoming JSON requests with a body size limit of 10kb
app.use(
  express.json({
    limit: "10kb",
  }),
);

// Middleware to sanitize user-supplied data to prevent NoSQL injection attacks
app.use(sanitize());

// Middleware to clean user input from malicious HTML code (cross-site scripting)
app.use(xss());

// Middleware to clean http pollution
app.use(
  hpp({
    whitelist: ["quantity", "expiryDate", "indication", "createdAt"],
  }),
);

// Mount routers for different parts of the API
app.use("/api/v2/medication", medicationRouter);
app.use("/api/v2/auth", authRouter);
app.use("/api/v2/user", userRouter);
app.use("/api/v2/messages", chatRouter);
// Handle undefined routes with a custom "Page Not Found" response
app.all("*", medicationController.pageNotFound);

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;

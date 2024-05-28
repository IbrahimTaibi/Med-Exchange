// authRoutes.js
const express = require("express");
const authController = require("../Controllers/authController");

const router = express.Router();

router.route("/").get((req, res) => {
  res.json({
    status: "hello",
  });
});

router.route("/signup").post(authController.signUp);
router.route("/login").post(authController.login);
router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);

// Add the new route for token validation
router.route("/validateToken").get(authController.validateToken);

module.exports = router;

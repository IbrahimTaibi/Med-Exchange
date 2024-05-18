const express = require("express");
const userController = require("../Controllers/userController");
const authController = require("../Controllers/authController");

router = express.Router();

router
  .route("/updatePassword")
  .patch(authController.isAuthenticated, userController.updatePassword);

router
  .route("/updateinfo")
  .patch(authController.isAuthenticated, userController.updateUserInfo);

module.exports = router;

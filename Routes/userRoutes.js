const express = require("express");
const userController = require("../Controllers/userController");
const authController = require("../Controllers/authController");

router = express.Router();

router.route("/").get(userController.getUsers);
router
  .route("/updatePassword")
  .patch(authController.isAuthenticated, userController.updatePassword);

router
  .route("/updateinfo")
  .patch(authController.isAuthenticated, userController.updateUserInfo);

router.route("/:id").get(userController.getUserById);
router
  .route("/deleteMe")
  .patch(authController.isAuthenticated, userController.deleteMe);

module.exports = router;

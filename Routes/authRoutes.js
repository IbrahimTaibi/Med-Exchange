const express = require("express");
const authController = require("../Controllers/authController");

router = express.Router();

router.route("/signup").post(authController.signUp); //.get(userController.getUsers);
router.route("/login").post(authController.login);
module.exports = router;

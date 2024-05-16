const express = require("express");
const userController = require("../Controllers/userController");

router = express.Router();

router.route("/signup").post(userController.signUp); //.get(userController.getUsers);

module.exports = router;

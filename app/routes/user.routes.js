const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/googleLogin", authController.googleLogin);
router.get("/", userController.getAll);


module.exports = router;

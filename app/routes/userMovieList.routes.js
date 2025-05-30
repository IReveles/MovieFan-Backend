const express = require("express");
const router = express.Router();
const listController = require("../controllers/userMovieList.controller");

router.post("/add", listController.addMovie);
router.get("/", listController.getUserMovies);

module.exports = router;

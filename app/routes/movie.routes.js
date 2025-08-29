const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movie.controller.js');

router.get('/search', movieController.search);
router.post('/get-or-create', movieController.getOrCreate);
router.get('/:id', movieController.getById);

module.exports = router;
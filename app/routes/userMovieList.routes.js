// routes/userMovieList.routes.js
const express = require('express');
const router = express.Router();
const userMovieListController = require('../controllers/userMovieList.controller.js');

router.post('/add-to-list', userMovieListController.addToList);
router.get('/my-lists', userMovieListController.getMyLists);
router.put('/:id', userMovieListController.updateEntry);
router.delete('/:id', userMovieListController.removeFromList);
router.get('/stats', userMovieListController.getStats);

module.exports = router;
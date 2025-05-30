const db = require("../models");
const UserMovieList = db.UserMovieList;
const Movie = db.Movie;

// Add movie to user list
exports.addMovie = async (req, res) => {
  try {
    const { user_id, movie, status, rating, review } = req.body;

    // Upsert movie if not in DB
    let [movieRecord] = await Movie.findOrCreate({
      where: { title: movie.title },
      defaults: movie,
    });

    const entry = await UserMovieList.create({
      user_id,
      movie_id: movieRecord.id,
      status,
      rating,
      review,
    });

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all movies for a user by status
exports.getUserMovies = async (req, res) => {
  const { user_id, status } = req.query;

  const entries = await UserMovieList.findAll({
    where: { user_id, ...(status && { status }) },
    include: [db.Movie],
  });

  res.json(entries);
};

const tmdbService = require('../services/tmdbService.js');
const { Movie } = require('../models');

const movieController = {
  // Search movies and TV shows
  async search(req, res) {
    try {
      const { query, page = 1 } = req.query;
      
      if (!query || query.trim().length === 0) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const results = await tmdbService.searchMulti(query, page);
      res.json(results);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get or create movie in database
  async getOrCreate(req, res) {
    try {
      const { tmdb_id, media_type } = req.body;

      if (!tmdb_id || !media_type) {
        return res.status(400).json({ 
          error: 'tmdb_id and media_type are required' 
        });
      }

      let movie = await Movie.findOne({ where: { tmdb_id } });

      if (!movie) {
        let movieData;
        if (media_type === 'movie') {
          movieData = await tmdbService.getMovieDetails(tmdb_id);
        } else if (media_type === 'tv') {
          movieData = await tmdbService.getTVDetails(tmdb_id);
        } else {
          return res.status(400).json({ error: 'Invalid media_type' });
        }

        movie = await Movie.create(movieData);
      }

      res.json({ movie });
    } catch (error) {
      console.error('Get or create movie error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get movie details by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      
      const movie = await Movie.findByPk(id);
      
      if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
      }

      res.json({ movie });
    } catch (error) {
      console.error('Get movie by ID error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = movieController;
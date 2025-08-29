// controllers/userMovieList.controller.js
const tmdbService = require('../services/tmdbService');
const { Movie, UserMovieList } = require('../models');

const userMovieListController = {
  // Add movie to user's list
  async addToList(req, res) {
    try {
      const { tmdb_id, media_type, status, user_id, is_favorite = false } = req.body;

      if (!tmdb_id || !media_type || !status || !user_id) {
        return res.status(400).json({ 
          error: 'tmdb_id, media_type, status, and user_id are required' 
        });
      }

      // Validate status
      if (!['to_watch', 'watched'].includes(status)) {
        return res.status(400).json({ 
          error: 'status must be either "to_watch" or "watched"' 
        });
      }

      // Check if movie exists in our database
      let movie = await Movie.findOne({ where: { tmdb_id } });

      // If not, fetch details from TMDB and save
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

      // Check if user already has this movie in their list
      const existingEntry = await UserMovieList.findOne({
        where: { 
          user_id: user_id, 
          movie_id: movie.id 
        }
      });

      if (existingEntry) {
        // Update existing entry
        const updateData = { status };
        if (is_favorite !== undefined) updateData.is_favorite = is_favorite;
        
        await existingEntry.update(updateData);
        res.json({ 
          message: 'Movie status updated', 
          movie,
          userMovieEntry: existingEntry 
        });
      } else {
        // Create new entry
        const userMovieEntry = await UserMovieList.create({
          user_id: user_id,
          movie_id: movie.id,
          status,
          is_favorite: is_favorite
        });

        res.status(201).json({ 
          message: 'Movie added to list', 
          movie,
          userMovieEntry 
        });
      }

    } catch (error) {
      console.error('Add to list error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get user's movie lists
  async getMyLists(req, res) {
    try {
      const { user_id, status, favorites_only } = req.query;

      if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
      }

      const whereClause = { user_id: user_id };
      
      // Filter by status if provided
      if (status) {
        whereClause.status = status;
      }
      
      // Filter favorites only if requested
      if (favorites_only === 'true') {
        whereClause.is_favorite = true;
        whereClause.status = 'watched'; // Favorites are watched movies
      }

      const userMovies = await UserMovieList.findAll({
        where: whereClause,
        include: [{
          model: Movie,
          as: 'Movie' // Make sure this matches your association alias
        }],
        order: [['createdAt', 'DESC']]
      });

      res.json(userMovies);
    } catch (error) {
      console.error('Get lists error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update user movie entry (rating, review, status, favorite)
  async updateEntry(req, res) {
    try {
      const { id } = req.params; // UserMovieList entry ID
      const { user_id, status, rating, review, is_favorite } = req.body;

      if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
      }

      const userMovieEntry = await UserMovieList.findOne({
        where: { 
          id: id,
          user_id: user_id // Ensure user can only update their own entries
        },
        include: [{
          model: Movie,
          as: 'Movie'
        }]
      });

      if (!userMovieEntry) {
        return res.status(404).json({ error: 'Movie entry not found' });
      }

      // Update only provided fields
      const updateData = {};
      if (status !== undefined) {
        if (!['to_watch', 'watched'].includes(status)) {
          return res.status(400).json({ 
            error: 'status must be either "to_watch" or "watched"' 
          });
        }
        updateData.status = status;
      }
      if (rating !== undefined) updateData.rating = rating;
      if (review !== undefined) updateData.review = review;
      if (is_favorite !== undefined) updateData.is_favorite = is_favorite;

      await userMovieEntry.update(updateData);

      res.json({ 
        message: 'Movie entry updated',
        userMovieEntry 
      });

    } catch (error) {
      console.error('Update entry error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Remove movie from user's list
  async removeFromList(req, res) {
    try {
      const { id } = req.params; // UserMovieList entry ID
      const { user_id } = req.query;

      if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
      }

      const userMovieEntry = await UserMovieList.findOne({
        where: { 
          id: id,
          user_id: user_id
        }
      });

      if (!userMovieEntry) {
        return res.status(404).json({ error: 'Movie entry not found' });
      }

      await userMovieEntry.destroy();

      res.json({ message: 'Movie removed from list' });

    } catch (error) {
      console.error('Remove from list error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get user's stats
  async getStats(req, res) {
    try {
      const { user_id } = req.query;

      if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
      }

      // Get counts by status and media type
      const stats = await UserMovieList.findAll({
        where: { user_id: user_id },
        include: [{
          model: Movie,
          as: 'Movie'
        }],
        raw: true,
        nest: true
      });

      const totalMovies = stats.filter(item => item.Movie.media_type === 'movie').length;
      const totalTVShows = stats.filter(item => item.Movie.media_type === 'tv').length;
      const watchedCount = stats.filter(item => item.status === 'watched').length;
      const toWatchCount = stats.filter(item => item.status === 'to_watch').length;
      const favoritesCount = stats.filter(item => item.is_favorite === true).length;

      // Calculate total watch time (rough estimate)
      const watchedItems = stats.filter(item => item.status === 'watched');
      let totalWatchTime = 0;

      watchedItems.forEach(item => {
        const movie = item.Movie;
        if (movie.media_type === 'movie' && movie.runtime) {
          totalWatchTime += movie.runtime;
        } else if (movie.media_type === 'tv' && movie.runtime && movie.number_of_episodes) {
          // Estimate: runtime per episode * number of episodes
          totalWatchTime += (movie.runtime * movie.number_of_episodes);
        }
      });

      res.json({
        totalMovies,
        totalTVShows,
        watchedCount,
        toWatchCount,
        favoritesCount,
        totalWatchTime, // in minutes
        totalWatchTimeHours: Math.round(totalWatchTime / 60)
      });

    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = userMovieListController;
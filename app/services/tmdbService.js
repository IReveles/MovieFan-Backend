const axios = require('axios');

class TMDBService {
  constructor() {
    this.apiKey = process.env.TMDB_API_KEY;
    this.baseURL = 'https://api.themoviedb.org/3';
    this.imageBaseURL = 'https://image.tmdb.org/t/p';
    
    if (!this.apiKey) {
      throw new Error('TMDB_API_KEY environment variable is required');
    }
  }

  // Search for movies and TV shows
  async searchMulti(query, page = 1) {
    try {
      const response = await axios.get(`${this.baseURL}/search/multi`, {
        params: {
          api_key: this.apiKey,
          query: query,
          page: page,
          include_adult: false
        }
      });

      return {
        results: response.data.results
          .map(item => this.transformSearchResult(item))
          .filter(item => item !== null), 
        total_pages: response.data.total_pages,
        total_results: response.data.total_results,
        page: response.data.page
      };
    } catch (error) {
      console.error('TMDB Search Error:', error.response?.data || error.message);
      throw new Error('Failed to search movies');
    }
  }

  // Get detailed movie information
  async getMovieDetails(tmdbId) {
    try {
      const response = await axios.get(`${this.baseURL}/movie/${tmdbId}`, {
        params: {
          api_key: this.apiKey
        }
      });

      return this.transformMovieDetails(response.data);
    } catch (error) {
      console.error('TMDB Movie Details Error:', error.response?.data || error.message);
      throw new Error('Failed to get movie details');
    }
  }

  // Get detailed TV show information
  async getTVDetails(tmdbId) {
    try {
      const response = await axios.get(`${this.baseURL}/tv/${tmdbId}`, {
        params: {
          api_key: this.apiKey
        }
      });

      return this.transformTVDetails(response.data);
    } catch (error) {
      console.error('TMDB TV Details Error:', error.response?.data || error.message);
      throw new Error('Failed to get TV details');
    }
  }

  // Transform search result to match database schema
  transformSearchResult(item) {
    if (item.media_type === 'person') {
      return null;
    }

    const isMovie = item.media_type === 'movie';
    
    return {
      tmdb_id: item.id,
      title: isMovie ? item.title : item.name,
      poster_url: item.poster_path ? this.getImageURL(item.poster_path, 'w500') : null,
      backdrop_url: item.backdrop_path ? this.getImageURL(item.backdrop_path, 'w1280') : null,
      overview: item.overview || '',
      release_date: isMovie ? item.release_date : item.first_air_date,
      vote_average: item.vote_average || 0,
      vote_count: item.vote_count || 0,
      media_type: item.media_type,
      runtime: null,
      genres: null,
      number_of_seasons: null,
      number_of_episodes: null
    };
  }

  // Transform detailed movie data
  transformMovieDetails(movie) {
    return {
      tmdb_id: movie.id,
      title: movie.title,
      poster_url: movie.poster_path ? this.getImageURL(movie.poster_path, 'w500') : null,
      backdrop_url: movie.backdrop_path ? this.getImageURL(movie.backdrop_path, 'w1280') : null,
      overview: movie.overview || '',
      release_date: movie.release_date,
      runtime: movie.runtime,
      genres: movie.genres || [],
      vote_average: movie.vote_average || 0,
      vote_count: movie.vote_count || 0,
      media_type: 'movie',
      number_of_seasons: null,
      number_of_episodes: null
    };
  }

  // Transform detailed TV data
  transformTVDetails(tv) {
    return {
      tmdb_id: tv.id,
      title: tv.name,
      poster_url: tv.poster_path ? this.getImageURL(tv.poster_path, 'w500') : null,
      backdrop_url: tv.backdrop_path ? this.getImageURL(tv.backdrop_path, 'w1280') : null,
      overview: tv.overview || '',
      release_date: tv.first_air_date,
      runtime: tv.episode_run_time?.[0] || null, // Average episode runtime
      genres: tv.genres || [],
      vote_average: tv.vote_average || 0,
      vote_count: tv.vote_count || 0,
      media_type: 'tv',
      number_of_seasons: tv.number_of_seasons,
      number_of_episodes: tv.number_of_episodes
    };
  }

  // Helper to construct image URLs
  getImageURL(path, size = 'w500') {
    if (!path) return null;
    return `${this.imageBaseURL}/${size}${path}`;
  }
}
module.exports = new TMDBService();
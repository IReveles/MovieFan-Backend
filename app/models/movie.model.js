module.exports = (sequelize, DataTypes) => {
  const Movie = sequelize.define('Movie', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tmdb_id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false 
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    poster_url: {
      type: DataTypes.TEXT 
    },
    backdrop_url: {
      type: DataTypes.TEXT 
    },
    overview: {
      type: DataTypes.TEXT
    },
    release_date: {
      type: DataTypes.DATEONLY
    },
    runtime: {
      type: DataTypes.INTEGER 
    },
    genres: {
      type: DataTypes.JSON 
    },
    vote_average: {
      type: DataTypes.DECIMAL(3, 1) 
    },
    vote_count: {
      type: DataTypes.INTEGER
    },
    media_type: {
      type: DataTypes.ENUM('movie', 'tv'),
      defaultValue: 'movie'
    },
    // For TV shows
    number_of_seasons: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    number_of_episodes: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['tmdb_id'] },
      { fields: ['title'] }
    ]
  });
    return Movie;
  };
  
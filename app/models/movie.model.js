module.exports = (sequelize, DataTypes) => {
    const Movie = sequelize.define("movie", {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      poster_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      release_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    });
  
    return Movie;
  };
  
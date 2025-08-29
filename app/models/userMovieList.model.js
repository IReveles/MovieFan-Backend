module.exports = (sequelize, DataTypes) => {
    const UserMovieList = sequelize.define("userMovieList", {
      status: {
        type: DataTypes.ENUM("to_watch", "watched", "favorite"),
        allowNull: false,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 0, max: 10 },
      },
      review: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_favorite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      }
    });
  
    return UserMovieList;
  };
  
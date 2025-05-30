const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('../../config/db.config');

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.DIALECT,
    port: dbConfig.PORT || 3306,
    logging: false,
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load models
db.User = require('./user.model')(sequelize, DataTypes);
db.Movie = require('./movie.model')(sequelize, DataTypes);
db.UserMovieList = require('./userMovieList.model')(sequelize, DataTypes);

// Define associations
db.User.hasMany(db.UserMovieList, { foreignKey: 'user_id' });
db.UserMovieList.belongsTo(db.User, { foreignKey: 'user_id' });

db.Movie.hasMany(db.UserMovieList, { foreignKey: 'movie_id' });
db.UserMovieList.belongsTo(db.Movie, { foreignKey: 'movie_id' });

module.exports = db;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./app/models');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database sync & server start
db.sequelize.sync({ force: true }) 
  .then(() => {
    console.log('📦 Database connected & synced');

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ DB Sync failed:', err.message);
  });


app.use("/users", require("./app/routes/user.routes"));
app.use('/movies', require('./app/routes/movie.routes'));
app.use('/user-movie-list', require('./app/routes/userMovieList.routes'));
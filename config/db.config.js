module.exports = {
    HOST: process.env.DB_HOST || "localhost",
    USER: process.env.DB_USER || "root",
    PASSWORD: process.env.DB_PASS || "",
    DB: process.env.DB_NAME || "moviedb",
    DIALECT: process.env.DB_DIALECT || "mysql",
    PORT: process.env.DB_PORT || 3306,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  };
  
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("user", {
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true, // null if using Google login
      },
      google_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    });
  
    return User;
  };
  
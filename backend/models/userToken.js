const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserToken = sequelize.define('UserToken', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tokenType: {
      type: DataTypes.STRING,
      defaultValue: 'Bearer'
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    scope: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Space-separated scopes'
    }
  }, {
    timestamps: true
  });

  UserToken.associate = (models) => {
    UserToken.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return UserToken;
};

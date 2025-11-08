const { Sequelize } = require('sequelize');
const databaseConfig = require('../config/database');

const sequelize = new Sequelize({
  ...databaseConfig
});

const db = {
  sequelize,
  Sequelize,
  models: {}
};

const initializeModels = () => {
  const modelDefiners = [
    require('./user'),
    require('./receipt')
  ];

  modelDefiners.forEach((defineModel) => {
    const model = defineModel(sequelize);
    db.models[model.name] = model;
  });

  const { User, Receipt } = db.models;

  if (User && Receipt) {
    User.hasMany(Receipt, { foreignKey: 'userId', as: 'receipts' });
    Receipt.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  }

  return db;
};

module.exports = {
  sequelize,
  initializeModels,
  get models() {
    if (!Object.keys(db.models).length) {
      initializeModels();
    }

    return db.models;
  }
};

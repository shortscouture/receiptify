const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'test' ? '.env.test' : '.env';
const envPath = path.resolve(__dirname, '..', envFile);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const defaultStorage = path.resolve(__dirname, '..', 'data', NODE_ENV === 'test' ? 'database.test.sqlite' : 'database.sqlite');

if (!fs.existsSync(path.dirname(defaultStorage))) {
  fs.mkdirSync(path.dirname(defaultStorage), { recursive: true });
}

module.exports = {
  dialect: 'sqlite',
  storage: process.env.DB_STORAGE || defaultStorage,
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  define: {
    underscored: true,
    timestamps: true,
    paranoid: false
  }
};

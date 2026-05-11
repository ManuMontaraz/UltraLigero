const mariadb = require('mariadb');
require('dotenv').config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ultraligero',
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10,
  insertIdAsNumber: true,
  supportBigNumbers: true,
  bigNumberStrings: false
});

module.exports = pool;

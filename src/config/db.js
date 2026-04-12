const { Pool } = require('pg');

console.log("ENV DATABASE_URL =>", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;

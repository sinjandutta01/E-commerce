require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('DB Error:', err);
  } else {
    console.log('DB Connected:', res.rows);
  }
});

module.exports = pool;

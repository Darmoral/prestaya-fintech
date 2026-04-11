const db = require('../config/db');

exports.create = async (name, email, password) => {
  const res = await db.query(
    "INSERT INTO users(name,email,password) VALUES($1,$2,$3) RETURNING *",
    [name, email, password]
  );
  return res.rows[0];
};

exports.findByEmail = async (email) => {
  const res = await db.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );
  return res.rows[0];
};
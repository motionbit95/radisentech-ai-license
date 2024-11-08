require("dotenv").config();
const mysql = require("mysql2/promise"); // mysql2 패키지 불러오기

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// const createConnection = async () => {
//   return mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//   });
// };

const getConnection = async () => {
  if (pool) {
    return pool.getConnection();
  } else {
    return (pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    }));
  }
};

module.exports = {
  pool,
  getConnection,
};

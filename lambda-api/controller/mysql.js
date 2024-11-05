require("dotenv").config();
const mysql = require("mysql2/promise"); // mysql2 패키지 불러오기
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // 최대 연결 수 설정
  queueLimit: 0,
});

module.exports = {
  pool,
};

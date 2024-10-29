require("dotenv").config();
const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http"); // serverless-http 패키지 불러오기
const mysql = require("mysql2/promise"); // mysql2 패키지 불러오기
const app = express();

const PORT = process.env.PORT || 3000;

// CORS 설정
app.use(cors());

// MySQL 연결 설정
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// 특정 테이블에서 리스트 조회하는 라우터 추가(테스트 코드 - krystal)
app.get("/table-list", async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query("SELECT * FROM users"); // 'your_table_name'을 실제 테이블 이름으로 변경
    res.json(rows);
  } catch (error) {
    console.error("MySQL query error: ", error);
    res.status(500).json({ error: "Database query error" });
  } finally {
    if (connection) await connection.end(); // 연결 종료
  }
});

// 라우터 설정
const authRouter = require("./authRouter");
app.use("/auth", authRouter);

// 로컬에서 실행될 때를 위한 서버 설정 (Lambda 배포 시에는 불필요)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Lambda 핸들러로 Express 앱을 래핑
module.exports.handler = serverless(app);

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http"); // serverless-http 패키지 불러오기
const mysql = require("mysql2/promise"); // mysql2 패키지 불러오기
const app = express();

const PORT = process.env.PORT || 3000;

// CORS 설정
app.use(cors());

// 라우터 설정
const authRouter = require("./authRouter");
app.use("/auth", authRouter);

const companyRouter = require("./companyRouter");
app.use("/company", companyRouter);

// 로컬에서 실행될 때를 위한 서버 설정 (Lambda 배포 시에는 불필요)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Lambda 핸들러로 Express 앱을 래핑
module.exports.handler = serverless(app);

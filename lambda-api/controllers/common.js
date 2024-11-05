require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise"); // mysql2 패키지 불러오기
const bcrypt = require("bcryptjs"); // 비밀번호 해싱을 위한 패키지 불러오기
const bodyParser = require("body-parser"); // json 파싱
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// .env 파일에서 비밀 키 및 포트 가져오기
const JWT_SECRET = process.env.JWT_SECRET;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // 최대 연결 수 설정
  queueLimit: 0,
});

// JWT 검증
const verifyToken = (req, res, next) => {
  // 따옴표 제거
  const token = req.headers.authorization?.split(" ")[1].replaceAll('"', "");
  console.log("token:", token);

  if (token === process.env.TEST_TOKEN) {
    req.user = {
      id: "Radisen",
    };
    next();
    return;
  }

  if (!token) return res.status(401).json({ message: "Access token missing" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT verification error:", err);
      return res.status(401).json({ message: "Authentication failed" });
    }

    req.user = {
      id: decoded.user_id,
    };

    next(); // 다음 미들웨어로 이동
  });
};

// 랜덤 Unique Code 생성
async function generateRandomCode(length = 12) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // 사용할 문자 집합
  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
}

// user_id의 복사본 고유를 생성하는 함수
async function generateUniqueCopyValue(connection, columnName, baseValue) {
  let newValue = `${baseValue}_copy`;
  let suffix = 1;

  // 동일한 패턴을 가진 항목들을 조회
  const [existingCopies] = await connection.execute(
    `SELECT ${columnName} FROM company WHERE ${columnName} LIKE ?`,
    [`${baseValue}_copy%`]
  );

  // 동일한 복사본의 개수를 카운팅하여 새로운 suffix를 생성
  const existingValues = existingCopies.map((row) => row[columnName]);
  while (existingValues.includes(newValue)) {
    suffix++;
    newValue = `${baseValue}_copy${suffix}`;
  }

  return newValue;
}

function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 월을 1부터 시작
  const day = String(date.getDate()).padStart(2, "0"); // 일

  return `${year}-${month}-${day}`;
}

module.exports = {
  verifyToken,
  generateRandomCode,
  generateUniqueCopyValue,
  formatDateToYYYYMMDD,
  pool,
};

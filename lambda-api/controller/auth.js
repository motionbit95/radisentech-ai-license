require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs"); // 비밀번호 해싱을 위한 패키지 불러오기
const bodyParser = require("body-parser"); // json 파싱
const jwt = require("jsonwebtoken");

// .env 파일에서 비밀 키 및 포트 가져오기
const JWT_SECRET = process.env.JWT_SECRET;

// JWT 검증
const verifyToken = (req, res, next) => {
  // 따옴표 제거
  const token = req.headers.authorization?.split(" ")[1].replaceAll('"', "");

  if (token === process.env.TEST_TOKEN) {
    req.user = {
      id: "Radisen",
    };
    next();
    return;
  }

  if (!token) return res.status(403).json({ message: "Access token missing" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT verification error:", err);
      return res.status(403).json({ message: "Authentication failed" });
    }

    req.user = {
      id: decoded.user_id,
    };

    next(); // 다음 미들웨어로 이동
  });
};

// JWT 생성
const generateToken = async (user) => {
  return jwt.sign({ user_id: user.id }, JWT_SECRET, {
    expiresIn: "1h",
  });
};

module.exports = { verifyToken, generateToken };

require("dotenv").config();

const express = require("express"); // node express 모듈
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser"); // json 파싱

const router = express.Router();
router.use(bodyParser.json());

const cors = require("cors"); // cors 패키지 불러오기
router.use(cors());

// .env 파일에서 비밀 키 및 포트 가져오기
const SECRET_KEY = process.env.SECRET_KEY;

// 로그인 엔드포인트
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  console.log(req.body);

  // todo - 유저 정보 확인

  // 예시 사용자 데이터 검증 (데모용으로 실제 데이터베이스 확인 대신 사용)
  if (username === "user" && password === "password") {
    // JWT 생성
    const token = jwt.sign({ username }, SECRET_KEY, {
      expiresIn: "1h",
    });
    return res.json({ token });
  }
  res.status(401).json({ message: "Invalid credentials" });
});

module.exports = router;

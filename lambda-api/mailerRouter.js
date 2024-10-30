require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser"); // json 파싱
const nodemailer = require("nodemailer");
const cors = require("cors"); // cors 패키지 불러오기

const router = express.Router();

router.use(cors());
router.use(bodyParser.json());

// 테스트
router.get("/", (req, res) => {
  res.send("Hello World!");
});

const codes = {}; // 이메일 코드 임시 저장소
// 이메일 설정
const transporter = nodemailer.createTransport({
  // Gmail로 발송하는 경우 //
  service: "gmail", // "gmail"

  // 사내 도메인으로 사용하는 경우
  //   host: 'smtp.yourcompany.com', // 사내 SMTP 서버 주소
  //   port: 587, // 포트 번호 (25, 587, 465 중 선택)
  //   secure: false, // true는 SSL 사용, false는 사용 안 함

  auth: {
    user: process.env.EMAIL_USER, // .env 파일에 이메일 주소 입력
    pass: process.env.EMAIL_PASS, // .env 파일에 비밀번호 입력
  },
});

router.post("/sendEmail", (req, res) => {
  const { to } = req.body;

  // 랜덤 6자리 코드 생성
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  codes[to] = code; // 코드를 임시로 저장

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Password Reset Code",
    text: `Your password reset code is ${code}.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email: ", error);
      return res.status(500).json({ message: "이메일 발송 실패" });
    }
    console.log("Email sent: " + info.response);
    res.status(200).json({ message: "이메일 발송 성공" });
  });
});

router.post("/validateCode", (req, res) => {
  const { email, code } = req.body;

  // 이메일에 저장된 코드와 비교
  if (codes[email] === code) {
    delete codes[email]; // 검증 후 코드 삭제
    return res.status(200).json({ message: "코드 검증 성공" });
  } else {
    return res.status(400).json({ message: "잘못된 코드입니다." });
  }
});

module.exports = router;

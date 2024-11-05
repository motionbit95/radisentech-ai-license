require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // 사용자 정의 도메인의 SMTP 서버
  port: 465, // 일반적으로 SSL은 465, TLS는 587
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER, // 발신자 이메일
    pass: process.env.EMAIL_PASS, // 발신자 이메일 비밀번호
  },
  connectionTimeout: 20000, // 연결 시간 제한을 20초로 설정
  greetingTimeout: 10000, // 서버 인사 응답 제한을 10초로 설정
  socketTimeout: 10000, // 소켓 타임아웃을 10초로 설정
});

// 메일 발신
const sendVerifyEmail = async (to, subject, code) => {
  await transporter
    .sendMail({
      from: `"Radisen" <${process.env.EMAIL}>`,
      to,
      subject,
      text: `Your verification code is ${code}`,
    })
    .catch((err) => {
      console.error("Error sending email:", err);
    });
};

module.exports = {
  transporter,
  sendVerifyEmail,
};

require("dotenv").config();
// const nodemailer = require("nodemailer");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

// const transporter = nodemailer.createTransport({
//   host: "smtp.hiworks.com", // 사용자 정의 도메인의 SMTP 서버
//   port: 465, // 일반적으로 SSL은 465, TLS는 587
//   secure: true, // true for 465, false for 587
//   auth: {
//     user: process.env.EMAIL_USER, // 발신자 이메일
//     pass: process.env.EMAIL_PASS, // 발신자 이메일 비밀번호
//   },
//   connectionTimeout: 10000, // 연결 시간 제한을 10초로 설정
//   greetingTimeout: 10000, // 서버 인사 응답 제한을 10초로 설정
//   socketTimeout: 10000, // 소켓 타임아웃을 10초로 설정
// });

// 메일 발신
// const sendVerifyEmail = async (to, subject, code) => {
//   await transporter
//     .sendMail({
//       from: `"Radisen" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       text: `Your verification code is ${code}`,
//     })
//     .catch((err) => {
//       console.error("Error sending email:", err);
//     });
// };

const sendSESVerifyEmail = async (to, subject, code) => {
  // SES 클라이언트 초기화
  const sesClient = new SESClient({
    region: "ap-northeast-2", // SES 리전 설정 (사용하는 리전으로 변경)
    // credentials: {
    //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    // },
  });

  // 이메일 전송 함수
  const sendEmail = async () => {
    const params = {
      Destination: {
        ToAddresses: [to], // 수신자 이메일 주소
      },
      Message: {
        Body: {
          Text: {
            Data: `Your verification code is ${code}`,
          },
        },
        Subject: { Data: subject },
      },
      Source: `"Radisen" <${process.env.EMAIL_USER}>`, // 발신자 이메일 주소 (검증된 이메일 주소)
    };

    try {
      // SES에 이메일 전송
      const command = new SendEmailCommand(params);
      console.log("Sending email...");
      const data = await sesClient.send(command); // await로 결과를 받아옵니다
      console.log("Email sent successfully:", data);
      return data; // 이메일 전송 후 데이터 반환
    } catch (err) {
      console.error("Error occurred:", err);
      throw err; // 오류 발생 시 에러 던짐
    }
  };

  // 이메일 전송 후 결과 반환
  return await sendEmail(); // 호출 결과를 반환
};

module.exports = {
  // transporter,
  // sendVerifyEmail,
  sendSESVerifyEmail,
};

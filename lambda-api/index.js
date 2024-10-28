require("dotenv").config();
const express = require("express");
const cors = require("cors"); // cors 패키지 불러오기
const app = express();

const PORT = process.env.PORT || 3000;

// 라우터 설정
const authRouter = require("./authRouter");
app.use("/auth", authRouter);

app.use(cors());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify("Hello from Lambda!"),
  };
};

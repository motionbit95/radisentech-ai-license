require("dotenv").config();
const mysql = require("mysql2/promise"); // mysql2 패키지 불러오기

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
  const existingValues = existingCopies?.map((row) => row[columnName]);
  while (existingValues.includes(newValue)) {
    suffix++;
    newValue = `${baseValue}_copy${suffix}`;
  }

  return newValue;
}

// 날짜 포맷팅
function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 월을 1부터 시작
  const day = String(date.getDate()).padStart(2, "0"); // 일

  return `${year}-${month}-${day}`;
}

// 날짜 시간 포맷팅
function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 월을 1부터 시작
  const day = String(date.getDate()).padStart(2, "0"); // 일

  const hours = String(date.getHours()).padStart(2, "0"); // 시
  const minutes = String(date.getMinutes()).padStart(2, "0"); //분
  const seconds = String(date.getSeconds()).padStart(2, "0"); // 시

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 주어진 GMT 형식 날짜를 원하는 포맷으로 변환
function formatFromGMT(dateString) {
  const date = new Date(dateString); // GMT 문자열을 Date 객체로 변환
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

module.exports = {
  generateRandomCode,
  generateUniqueCopyValue,
  formatDateToYYYYMMDD,
  formatDateTime,
  formatFromGMT,
};

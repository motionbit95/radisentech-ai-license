require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise"); // mysql2 패키지 불러오기
const bodyParser = require("body-parser"); // json 파싱
const cors = require("cors");

const router = express.Router();
router.use(cors());
router.use(bodyParser.json());

// MySQL 연결 설정
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// 모든 LicenseManagement 리스트를 출력하는 엔드포인트
router.get("/list", async (req, res) => {
  console.log("GET /license/list");
  let connection;
  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig);

    // LicenseManagement 테이블의 모든 데이터를 가져오는 쿼리
    const [rows] = await connection.execute("SELECT * FROM LicenseManagement");

    // 결과를 클라이언트에 JSON 형식으로 반환
    res.status(200).json({
      status: "success",
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      status: "error",
      message: "Database error",
      error: error.message,
    });
  } finally {
    // 데이터베이스 연결 해제
    if (connection) await connection.end();
  }
});

// LicenseManagement 데이터 삽입 엔드포인트
router.post("/add", async (req, res) => {
  const {
    DealerCompany,
    Company,
    Country,
    AIType,
    Hospital,
    UserEmail,
    HardWareInfo,
    DetectorSerialNumber,
    LocalActivateStartDate,
    LocalTerminateDate,
    UTCActivateStartDate,
    UTCTerminateDate,
    ActivateCount,
    UniqueCode,
  } = req.body;

  let connection;
  try {
    // 필수 필드가 누락된 경우 에러 반환
    if (
      !DealerCompany ||
      !Company ||
      !Country ||
      !AIType ||
      !Hospital ||
      !LocalActivateStartDate ||
      !LocalTerminateDate ||
      !UTCActivateStartDate ||
      !UTCTerminateDate ||
      !ActivateCount
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig);

    // 데이터 삽입 쿼리 실행
    const query = `
        INSERT INTO LicenseManagement (
          DealerCompany, Company, Country, AIType, Hospital, 
          UserEmail, HardWareInfo, DetectorSerialNumber, 
          LocalActivateStartDate, LocalTerminateDate, 
          UTCActivateStartDate, UTCTerminateDate, 
          ActivateCount, UniqueCode
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

    const [result] = await connection.execute(query, [
      DealerCompany,
      Company,
      Country,
      AIType,
      Hospital,
      UserEmail,
      HardWareInfo,
      DetectorSerialNumber,
      LocalActivateStartDate,
      LocalTerminateDate,
      UTCActivateStartDate,
      UTCTerminateDate,
      ActivateCount,
      UniqueCode,
    ]);

    // 삽입 성공 응답
    res.status(201).json({
      status: "success",
      message: "Data inserted successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({
      status: "error",
      message: "Database error",
      error: error.message,
    });
  } finally {
    // 데이터베이스 연결 해제
    if (connection) await connection.end();
  }
});

module.exports = router;

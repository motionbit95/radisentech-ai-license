require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise"); // mysql2 패키지 불러오기
const bodyParser = require("body-parser"); // json 파싱
const jwt = require("jsonwebtoken");
const cors = require("cors");

const router = express.Router();
router.use(cors());
router.use(bodyParser.json());

/**
 * @swagger
 * tags:
 *   name: License
 *   description: License 정보 관련 API
 */

// MySQL 연결 설정
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// JWT 검증
const verifyToken = (req, res, next) => {
  // 따옴표 제거
  const token = req.headers.authorization?.split(" ")[1].replaceAll('"', "");

  if (!token) return res.status(401).json({ message: "Access token missing" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT verification error:", err);
      return res.status(401).json({ message: "Authentication failed" });
    }

    req.userId = decoded.userId; // 사용자 ID를 요청 객체에 저장
    next(); // 다음 미들웨어로 이동
  });
};

/**
 * @swagger
 * /license/list:
 *   get:
 *     tags: [License]
 *     summary: License 조회
 *     description: license table list를 조회
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: 인증 토큰 헤더(Bearer [Access Token])
 *     responses:
 *       200:
 *         description: license table list를 조회
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               pk:
 *                 type: integer
 *                 description: license pk
 *               DealerCompany:
 *                 type: string
 *                 description: DealerCompany
 *               Company:
 *                 type: string
 *                 description: Company
 *               Country:
 *                 type: string
 *                 description: Country
 *               AIType:
 *                 type: string
 *                 description: AIType
 *               Hospital:
 *                 type: string
 *                 description: Hospital
 *               UserEmail:
 *                 type: string
 *                 description: UserEmail
 *               HardWareInfo:
 *                 type: string
 *                 description: HardWareInfo
 *               DetectorSerialNumber:
 *                 type: string
 *                 description: DetectorSerialNumber
 *               UpdatedAt:
 *                 type: string
 *                 description: UpdatedAt
 *       500:
 *         description: Database error
 *       404:
 *         description: User not found
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 */
router.get("/list", verifyToken, async (req, res) => {
  let connection;
  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig);

    // LicenseManagement 테이블의 모든 데이터를 가져오는 쿼리
    const [rows] = await connection.execute("SELECT * FROM LicenseManagement");

    //data 예시
    // const data = {
    //   pk: 1,
    //   DealerCompany: "Example Dealer",
    //   Company: "Example Company",
    //   Country: "Example Country",
    //   AIType: "Example AIType",
    //   Hospital: "Example Hospital",
    //   UserEmail: "user@example.com",
    //   HardWareInfo: "Example Hardware Info",
    //   DetectorSerialNumber: "SN123456789",
    //   LocalActivateStartDate: "2024-09-30T23:00:00.000Z",
    //   LocalTerminateDate: "2025-09-30T15:00:00.000Z",
    //   UTCActivateStartDate: "2024-09-30T15:00:00.000Z",
    //   UTCTerminateDate: "2025-09-30T15:00:00.000Z",
    //   ActivateCount: 5,
    //   UniqueCode: "UNIQUECODE123",
    //   UpdatedAt: null,
    // };

    // 결과를 클라이언트에 JSON 형식으로 반환
    res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
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

router.post("/add", verifyToken, async (req, res) => {
  /*
  DealerCompany: 'Radisen',
  Company: 'FastFive',
  Country: 'Korea',
  AIType: 'Chest',
  Hospital: 'Hospital',
  UserEmail: 'test@example.com',
  UserName: 'name',
  HardWareInfo: '1234',
  DetectorSerialNumber: '1234',
  date_range: [ '2024-11-01T06:28:50.925Z', '2024-11-29T15:00:00.000Z' ],
  UniqueCode: 'Code',
  LocalActivateStartDate: '2024-11-01',
  LocalTerminateDate: '2024-11-30',
  UTCActivateStartDate: '2024-11-01T06:28:50.925Z',
  UTCTerminateDate: '2024-11-29T15:00:00.000Z'
  */

  const {
    DealerCompany,
    Company,
    Country,
    AIType,
    Hospital,
    UserEmail,
    UserName,
    HardWareInfo,
    DetectorSerialNumber,
    UniqueCode,
    LocalActivateStartDate,
    LocalTerminateDate,
    UTCActivateStartDate,
    UTCTerminateDate,
  } = req.body;

  // 필수 필드 확인
  if (
    !DealerCompany ||
    !Company ||
    !Country ||
    !AIType ||
    !Hospital ||
    !UniqueCode ||
    !LocalActivateStartDate ||
    !LocalTerminateDate ||
    !UTCActivateStartDate ||
    !UTCTerminateDate
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let connection;
  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig);

    // LicenseManagement 테이블에 데이터 추가하는 쿼리
    const insertQuery = `
      INSERT INTO LicenseManagement
      (DealerCompany, Company, Country, AIType, Hospital, UserEmail, UserName, HardWareInfo, DetectorSerialNumber, LocalActivateStartDate, LocalTerminateDate, UTCActivateStartDate, UTCTerminateDate, UniqueCode)
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const parameters = [
      DealerCompany,
      Company,
      Country,
      AIType,
      Hospital,
      UserEmail || null, // null로 처리
      UserName || null, // null로 처리
      HardWareInfo || null, // null로 처리
      DetectorSerialNumber || null, // null로 처리
      LocalActivateStartDate,
      LocalTerminateDate,
      UTCActivateStartDate,
      UTCTerminateDate,
      UniqueCode,
    ].map((param) => (param === undefined ? null : param)); // undefined를 null로 변경

    const [result] = await connection.execute(insertQuery, parameters);

    console.log("Rows inserted:", result.affectedRows);
    res.status(200).json({
      status: "success",
      message: "Data added successfully",
      data: result,
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

function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 월을 1부터 시작
  const day = String(date.getDate()).padStart(2, "0"); // 일

  return `${year}-${month}-${day}`;
}

/**
 * @swagger
 * /license/update-subscription/{pk}:
 *   put:
 *     summary: expire date update
 *     description: 특정 ID의 ExpireDate를 기준으로 LocalTerminateDate와 UTCTerminateDate를 업데이트하는 엔드포인트
 *     tags: [License]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: 인증 토큰 헤더(Bearer [Access Token])
 *       - in: path
 *         name: pk
 *         schema:
 *           type: integer
 *         required: true
 *         description: LicenseManagement pk
 *       - in: body
 *         name: body
 *         schema:
 *           type: object
 *           properties:
 *             ExpireDate:
 *               type: string
 *               description: LicenseManagement ExpireDate
 *         required: true
 *         description: LicenseManagement ExpireDate
 *     responses:
 *       200:
 *         description: SUCCESS
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Database error
 *       404:
 *         description: LicenseManagement NOT FOUND
 */
router.put("/update-subscription/:pk", verifyToken, async (req, res) => {
  const { pk } = req.params;
  const { ExpireDate } = req.body;

  // 요청 유효성 검사
  if (!ExpireDate) {
    return res.status(400).json({ error: "ExpireDate is required" });
  }

  let connection;

  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig);

    // ExpireDate 변환: LocalTerminateDate와 UTCTerminateDate 계산
    const expireDateObj = new Date(ExpireDate);
    const localTerminateDate = expireDateObj.toISOString().split("T")[0]; // Local 날짜
    const utcTerminateDate = formatDateToYYYYMMDD(expireDateObj);

    // 업데이트 쿼리 작성
    const updateQuery = `
      UPDATE LicenseManagement 
      SET 
        LocalTerminateDate = ?, 
        UTCTerminateDate = ?,
        ActivateCount = ActivateCount + 1
      WHERE pk = ?
    `;

    // 현재 ExpireDate 가져오기
    const [currentRows] = await connection.execute(
      "SELECT LocalTerminateDate, ActivateCount FROM LicenseManagement WHERE pk = ?",
      [pk]
    );

    if (currentRows.length === 0) {
      return res.status(404).json({ error: "License not found" });
    }

    const currentExpireDate = new Date(currentRows[0].LocalTerminateDate);

    // 이전과 새로운 ExpireDate 비교
    if (formatDateToYYYYMMDD(currentExpireDate) === utcTerminateDate) {
      return res.status(500).json({
        message: "No changes made. ExpireDate is the same.",
      });
    }

    // license_history 테이블에 데이터 삽입
    const insertHistoryQuery = `
      INSERT INTO license_history (license_pk, previous_expire_date, new_expire_date)
      VALUES (?, ?, ?);
    `;
    await connection.execute(insertHistoryQuery, [
      pk,
      formatDateToYYYYMMDD(currentExpireDate),
      utcTerminateDate,
    ]);

    // 업데이트 쿼리 실행
    await connection.execute(updateQuery, [
      localTerminateDate,
      utcTerminateDate,
      pk,
    ]);

    res.status(200).json({
      message: "Subscription updated successfully",
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  } finally {
    // 데이터베이스 연결 종료
    if (connection) {
      await connection.end();
      console.log("Connection closed");
    }
  }
});

/**
 * @swagger
 * /license/license-history/{pk}:
 *   get:
 *     summary: license_history
 *     description: 특정 license_pk의 변경 이력 조회
 *     tags: [License]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: 인증 토큰 헤더(Bearer [Access Token])
 *       - in: path
 *         name: pk
 *         schema:
 *           type: integer
 *         required: true
 *         description: license_history pk
 *     responses:
 *       200:
 *         description: SUCCESS
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Database error
 *       404:
 *         description: license_history NOT FOUND
 */
router.get("/license-history/:pk", verifyToken, async (req, res) => {
  const { pk } = req.params;

  let connection;

  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig);

    // license_history에서 특정 license_pk의 변경 이력 조회
    const [historyRows] = await connection.execute(
      "SELECT * FROM license_history WHERE license_pk = ? ORDER BY update_date DESC",
      [pk]
    );

    if (historyRows.length === 0) {
      return res
        .status(404)
        .json({ message: "No history found for this license." });
    }

    res.status(200).json(historyRows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  } finally {
    // 데이터베이스 연결 종료
    if (connection) {
      await connection.end();
      console.log("Connection closed");
    }
  }
});

module.exports = router;

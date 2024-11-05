require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise"); // mysql2 패키지 불러오기
const bcrypt = require("bcryptjs"); // 비밀번호 해싱을 위한 패키지 불러오기
const bodyParser = require("body-parser"); // json 파싱
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const router = express.Router();
const cors = require("cors"); // cors 패키지 불러오기
router.use(cors());
router.use(bodyParser.json());

/**
 * @swagger
 * tags:
 *   name: Company
 *   description: 회사 정보 관련 API
 */

// .env 파일에서 비밀 키 및 포트 가져오기
const JWT_SECRET = process.env.JWT_SECRET;

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

// 랜덤 Unique Code 생성 - temp
async function generateRandomCode(length = 12) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // 사용할 문자 집합
  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
}

// user_id의 복사본 고유 값을 생성하는 함수
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

/**
 * @swagger
 * /company/login:
 *   post:
 *     tags: [Company]
 *     summary: 로그인
 *     description: 사용자 로그인 후 JWT 토큰을 반환합니다.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: user
 *         description: 로그인 자격 증명
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - user_id
 *             - password
 *           properties:
 *             user_id:
 *               type: string
 *               description: 로그인 ID
 *             password:
 *               type: string
 *               description: 로그인 비밀번호
 *     responses:
 *       200:
 *         description: 로그인 성공, JWT 토큰 반환
 *         schema:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: JWT 토큰
 *       401:
 *         description: 로그인 실패 (유효하지 않은 자격 증명)
 */
router.post("/login", async (req, res) => {
  const { user_id, password } = req.body;

  if (!user_id || !password) {
    return res.status(400).json({ error: "user_id and password are required" });
  }

  let connection;
  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig);

    // user_id로 사용자 검색
    const query = "SELECT * FROM company WHERE user_id = ?";
    const [rows] = await connection.execute(query, [user_id]);

    // 사용자가 없는 경우
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid user_id or password" });
    }

    const user = rows[0];

    // 비밀번호 비교
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid user_id or password" });
    }

    // JWT 생성
    const token = jwt.sign({ user_id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // 로그인 성공
    res.json({
      status: "success",
      message: "Login successful",
      userId: user.id,
      token: token,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ status: "error", error: "Database error" });
  } finally {
    if (connection) await connection.end(); // 연결 종료
  }
});

/**
 * @swagger
 * /company/list:
 *   get:
 *     tags: [Company]
 *     summary: Company 조회
 *     description: company table list를 조회
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
 *         description: company table list를 조회
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: company ID
 *               user_id:
 *                 type: string
 *                 description: user ID
 *               password:
 *                 type: string
 *                 description: password
 *               email:
 *                 type: string
 *                 description: email
 *               company_name:
 *                 type: string
 *                 description: company_name
 *               user_name:
 *                 type: string
 *                 description: user_name
 *               address:
 *                 type: string
 *                 description: address
 *               phone:
 *                 type: string
 *                 description: phone
 *               created_at:
 *                 type: string
 *                 description: created_at
 *               updated_at:
 *                 type: string
 *                 description: updated_at
 *       500:
 *         description: MySQL query error
 *       401:
 *         description: Unauthorized
 * */
router.get("/list", verifyToken, async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query("SELECT * FROM company"); // 'your_table_name'을 실제 테이블 이름으로 변경
    res.json(rows);
  } catch (error) {
    console.error("MySQL query error: ", error);
    res.status(500).json({ error: "Database query error" });
  } finally {
    if (connection) await connection.end(); // 연결 종료
  }
});

/**
 * @swagger
 * /company/add:
 *   post:
 *     tags: [Company]
 *     summary: 회원가입
 *     description: company table data 삽입
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: company
 *         description: company data 삽입
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - user_id
 *             - password
 *             - email
 *             - company_name
 *             - user_name
 *             - address
 *             - phone
 *           properties:
 *             user_id:
 *               type: string
 *               description: user_id
 *             password:
 *               type: string
 *               description:	password
 *             email:
 *               type: string
 *               description: email
 *             company_name:
 *               type: string
 *               description: company_name
 *             user_name:
 *               type: string
 *               description: user_name
 *             address:
 *               type: string
 *               description: address
 *             phone:
 *               type: string
 *               description: phone
 *     responses:
 *       200:
 *         description: company table data 삽입
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Database error
 *       401:
 *         description: Unauthorized
 * */
router.post("/add", async (req, res) => {
  const { user_id, password, email, company_name, user_name, address, phone } =
    req.body;

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(password, 10);

  const unique_code = await generateRandomCode();

  // 필수 필드가 누락된 경우 에러 응답
  if (!user_id || !password || !email || !company_name || !user_name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let connection;
  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig);

    // 데이터 삽입 쿼리 실행
    const query = `
        INSERT INTO company (user_id, password, email, company_name, user_name, address, phone, unique_code)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
    const [result] = await connection.execute(query, [
      user_id,
      hashedPassword,
      email,
      company_name,
      user_name,
      address,
      phone,
      unique_code,
    ]);

    // 성공 응답
    res.status(201).json({
      status: "success",
      message: "User added successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({
      status: "error",
      error: "Database error",
      message: error.sqlMessage,
    });
  } finally {
    if (connection) await connection.end(); // 연결 종료
  }
});

/**
 * @swagger
 * /company/update/{id}:
 *   put:
 *     tags: [Company]
 *     summary: 회사정보 수정
 *     description: company table data 변경
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: 인증 토큰 헤더(Bearer [Access Token])
 *       - in: path
 *         name: id
 *         description: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 1
 *       - in: body
 *         name: company
 *         description: company data 변경
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - id
 *           properties:
 *             user_id:
 *               type: string
 *               description: user_id
 *             email:
 *               type: string
 *               description: email
 *             company_name:
 *               type: string
 *               description: company_name
 *             user_name:
 *               type: string
 *               description: user_name
 *             address:
 *               type: string
 *               description: address
 *             phone:
 *               type: string
 *               description: phone
 *             unique_code:
 *               type: string
 *               description: unique_code
 *     responses:
 *       200:
 *         description: company table data 변경
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Database error
 *       401:
 *         description: Unauthorized
 * */
router.put("/update/:id", verifyToken, async (req, res) => {
  const id = req.params.id; // URL에서 row id를 가져옵니다.
  const {
    user_id,
    email,
    company_name,
    user_name,
    address,
    phone,
    unique_code,
    permission_flag,
  } = req.body;

  let connection;
  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig);

    // 수정할 데이터가 있는지 확인
    const [existingUser] = await connection.execute(
      "SELECT * FROM company WHERE id = ?",
      [id]
    );
    if (existingUser.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    if (existingUser[0].permission_flag === "Y") {
      // permission_flag가 Y인 사용자 수 조회
      const [userCountRows] = await connection.execute(
        "SELECT COUNT(*) AS count FROM company WHERE permission_flag = 'Y'"
      );
      const userCount = userCountRows[0].count;

      // permission_flag가 Y인 사용자가 1명 이하인 경우 삭제 불가능
      if (userCount <= 1) {
        return res.status(403).json({
          error:
            "Cannot delete user! Permission flag 'Y' user count is 1 or less.",
        });
      }
    }

    // 데이터 수정 쿼리 실행
    const query = `
        UPDATE company 
        SET 
          user_id = COALESCE(?, user_id),
          email = COALESCE(?, email), 
          company_name = COALESCE(?, company_name), 
          user_name = COALESCE(?, user_name), 
          address = COALESCE(?, address), 
          phone = COALESCE(?, phone), 
          unique_code = COALESCE(?, unique_code),
          permission_flag = COALESCE(?, permission_flag) 
        WHERE id = ?
      `;

    console.log(
      user_id,
      email,
      company_name,
      user_name,
      address,
      phone,
      unique_code,
      permission_flag,
      id
    );

    await connection.execute(query, [
      user_id,
      email,
      company_name,
      user_name,
      address,
      phone,
      unique_code,
      permission_flag,
      id,
    ]);

    // 성공 응답
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (connection) await connection.end(); // 연결 종료
  }
});

/**
 * @swagger
 * /company/check-user-id/{user_id}:
 *   get:
 *     tags: [Company]
 *     summary: 사용자 ID 존재 확인
 *     description: user_id 존재 확인
 *     parameters:
 *       - in: path
 *         name: user_id
 *         description: user_id
 *         required: true
 *         schema:
 *           type: string
 *         example: user1
 *     responses:
 *       200:
 *         description: 사용자 ID 존재 확인
 *       500:
 *         description: Database error
 * */
router.get("/check-user-id/:user_id", async (req, res) => {
  const userId = req.params.user_id; // URL에서 user_id를 가져옵니다.

  let connection;
  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig);

    // user_id 존재 여부 확인
    const [results] = await connection.execute(
      "SELECT * FROM company WHERE user_id = ?",
      [userId]
    );

    // user_id가 존재하는 경우
    if (results.length > 0) {
      return res
        .status(200)
        .json({ exists: true, message: "User ID already exists" });
    } else {
      // user_id가 존재하지 않는 경우
      return res
        .status(200)
        .json({ exists: false, message: "User ID is available" });
    }
  } catch (error) {
    console.error("Error checking user ID:", error);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (connection) await connection.end(); // 연결 종료
  }
});

/**
 * @swagger
 * /company/update-license/{user_id}:
 *   put:
 *     tags: [Company]
 *     summary: 라이센스 수량 생성
 *     description: company table data 변경(라이센스 수량 생성)
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: 인증 토큰 헤더(Bearer [Access Token])
 *       - in: path
 *         name: id
 *         description: company pk
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: body
 *         name: body
 *         description: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             license_cnt:
 *               type: integer
 *               description: license_cnt
 *               example: 5
 *     responses:
 *       200:
 *         description: 라이센스 수량 변경
 *       400:
 *         description: Missing required field [license_cnt]
 *       404:
 *         description: User not found
 *       500:
 *         description: Database error
 * */
router.put("/update-license/:id", verifyToken, async (req, res) => {
  const id = req.params.id; // URL에서 user_id를 가져옵니다.
  const { license_cnt, description, canceled } = req.body; // body에서 license_cnt 값을 가져옵니다.

  // 필수 필드가 누락된 경우 에러 응답
  if (license_cnt === undefined) {
    return res
      .status(400)
      .json({ error: "Missing required field [license_cnt]" });
  }

  let connection;
  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig);

    // user_id 존재 여부 확인
    const [existingUser] = await connection.execute(
      "SELECT license_cnt FROM company WHERE id = ?",
      [id]
    );
    if (existingUser.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // 기존 license_cnt 값 가져오기
    const currentLicenseCnt = existingUser[0].license_cnt;

    // 새로운 license_cnt 계산
    const updatedLicenseCnt =
      parseInt(currentLicenseCnt) + parseInt(license_cnt);

    // license_cnt 수정 쿼리 실행
    const query = "UPDATE company SET license_cnt = ? WHERE id = ?";
    await connection.execute(query, [updatedLicenseCnt, id]);

    // 라이센스 변경 내역을 DB에 저장
    // Insert data into generate_history
    const insertQuery = `
INSERT INTO generate_history (create_time, description, company_pk, prev_cnt, new_cnt, canceled)
VALUES (?, ?, ?, ?, ?, ?)`;

    const values = [
      new Date(), // create_time
      description, // description
      id, // company_pk (make sure this exists in the company table)
      currentLicenseCnt, // prev_cnt
      updatedLicenseCnt, // new_cnt
      canceled,
    ];

    connection.query(insertQuery, values, (err, results) => {
      if (err) {
        console.error("Error inserting data:", err);
        return;
      }
      console.log("Data inserted successfully:", results.insertId);
    });

    // 성공 응답
    res.status(200).json({
      message: "License count updated successfully",
      updatedLicenseCnt,
    });
  } catch (error) {
    console.error("Error updating license count:", error);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (connection) await connection.end(); // 연결 종료
  }
});

/**
 * @swagger
 * /company/delete/{id}:
 *   delete:
 *     tags: [Company]
 *     summary: 사용자 삭제
 *     description: company table data 삭제
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: 인증 토큰 헤더(Bearer [Access Token])
 *       - in: path
 *         name: id
 *         description: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: 사용자 삭제
 *       404:
 *         description: User not found
 *       500:
 *         description: Database error
 * */
router.delete("/delete/:id", verifyToken, async (req, res) => {
  const id = req.params.id; // URL에서 id를 가져옵니다.

  let connection;
  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig);

    // id 존재 여부 확인
    const [existingUser] = await connection.execute(
      "SELECT * FROM company WHERE id = ?",
      [id]
    );
    if (existingUser.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // id로 행 삭제
    await connection.execute("DELETE FROM company WHERE id = ?", [id]);

    // 성공 응답
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (connection) await connection.end(); // 연결 종료
  }
});

/**
 * @swagger
 * /company/copy-user/{id}:
 *   post:
 *     tags: [Company]
 *     summary: 사용자 복사
 *     description: company table data 복사
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: 인증 토큰 헤더(Bearer [Access Token])
 *       - in: path
 *         name: id
 *         description: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: 사용자 복사
 *       404:
 *         description: User not found
 *       500:
 *         description: Database error
 * */
router.post("/copy-user/:id", verifyToken, async (req, res) => {
  const id = req.params.id; // URL에서 id를 가져옵니다.

  let connection;
  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig);

    // 기존 행 조회
    const [existingUser] = await connection.execute(
      "SELECT * FROM company WHERE id = ?",
      [id]
    );
    if (existingUser.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // 기존 행 데이터에서 ID를 제외하고 복사할 데이터 준비
    const userData = existingUser[0];
    delete userData.id; // 자동 증가 컬럼 id는 제거

    // 고유한 user_id와 email 값을 생성
    userData.user_id = await generateUniqueCopyValue(
      connection,
      "user_id",
      userData.user_id
    );
    userData.unique_code = await generateRandomCode();

    // 새로운 행 삽입 쿼리 작성
    const columns = Object.keys(userData).join(", ");
    const placeholders = Object.keys(userData)
      .map(() => "?")
      .join(", ");
    const values = Object.values(userData);

    const insertQuery = `INSERT INTO company (${columns}) VALUES (${placeholders})`;
    await connection.execute(insertQuery, values);

    // 성공 응답
    res
      .status(201)
      .json({ message: "User copied successfully", data: userData });
  } catch (error) {
    console.error("Error copying user:", error);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (connection) await connection.end(); // 연결 종료
  }
});

// Nodemailer 설정
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // 발신자 이메일
    pass: process.env.EMAIL_PASS, // 발신자 이메일 비밀번호
  },
});

/**
 * @swagger
 * /company/request-reset-code:
 *   post:
 *     tags: [Company]
 *     summary: 인증 코드 발송
 *     description: 인증 코드 발송
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 인증 코드 저장 및 발송
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             user_id:
 *               type: string
 *             email:
 *               type: string
 *               format: email
 *     responses:
 *       200:
 *         description: 인증 코드 저장 및 발송
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Invalid user ID or email
 *       500:
 *         description: Database error
 * */
router.post("/request-reset-code", async (req, res) => {
  const { user_id, email } = req.body;

  // 필수 필드 확인
  if (!user_id || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let connection;
  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig);

    console.log("user_id:", user_id, "email:", email);
    // 사용자 조회
    const [rows] = await connection.execute(
      "SELECT * FROM company WHERE user_id = ? AND email = ?",
      [user_id, email]
    );

    // 사용자 없음
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid user ID or email" });
    }

    // 인증 코드 생성
    const authCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6자리 랜덤 숫자

    // 인증 코드의 만료 시간을 설정 (예: 10분 후)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 인증 코드 DB에 저장 (기존의 코드를 업데이트하거나 새로 삽입)
    await connection.execute(
      "INSERT INTO auth_codes (user_id, code, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE code = ?, expires_at = ?",
      [user_id, authCode, expiresAt, authCode, expiresAt]
    );

    // 이메일로 인증 코드 전송
    await transporter.sendMail({
      from: `"Your Company" <${process.env.EMAIL}>`,
      to: email,
      subject: "Your Authentication Code",
      text: `Your authentication code is ${authCode}`,
    });

    // 성공 응답
    res.status(200).json({ message: "Authentication code sent to email" });
  } catch (error) {
    console.error("Error requesting reset code:", error);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (connection) await connection.end(); // 연결 종료
  }
});

/**
 * @swagger
 * /company/send-code:
 *   post:
 *     tags: [Company]
 *     summary: 인증 코드 발송
 *     description: 인증 코드 발송
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 인증 코드 저장 및 발송
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             user_id:
 *               type: string
 *             email:
 *               type: string
 *               format: email
 *     responses:
 *       200:
 *         description: 인증 코드 저장 및 발송
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Invalid user ID or email
 *       500:
 *         description: Database error
 * */
router.post("/send-code", async (req, res) => {
  const { user_id, email } = req.body;

  // 필수 필드 확인
  if (!user_id || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let connection;
  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig);

    console.log("user_id:", user_id, "email:", email);

    // 인증 코드 생성
    const authCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6자리 랜덤 숫자

    // 인증 코드의 만료 시간을 설정 (예: 10분 후)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 인증 코드 DB에 저장 (기존의 코드를 업데이트하거나 새로 삽입)
    await connection.execute(
      "INSERT INTO auth_codes (user_id, code, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE code = ?, expires_at = ?",
      [user_id, authCode, expiresAt, authCode, expiresAt]
    );

    // 이메일로 인증 코드 전송
    await transporter.sendMail({
      from: `"Your Company" <${process.env.EMAIL}>`,
      to: email,
      subject: "Your Authentication Code",
      text: `Your authentication code is ${authCode}`,
    });

    // 성공 응답
    res.status(200).json({ message: "Authentication code sent to email" });
  } catch (error) {
    console.error("Error requesting reset code:", error);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (connection) await connection.end(); // 연결 종료
  }
});

/**
 * @swagger
 * /company/verify-code:
 *   post:
 *     tags: [Company]
 *     summary: 인증 코드 확인
 *     description: 인증 코드 확인
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 인증 코드 확인
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             user_id:
 *               type: string
 *             authCode:
 *               type: string
 *     responses:
 *       200:
 *         description: 인증 코드 확인
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Invalid authentication code
 *       500:
 *         description: Database error
 * */
router.post("/verify-code", async (req, res) => {
  const { user_id, authCode } = req.body;

  console.log("user_id:", user_id, "authCode:", authCode);

  // 필수 필드 확인
  if (!user_id || !authCode) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let connection;
  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig);

    // DB에서 인증 코드 조회
    const [rows] = await connection.execute(
      "SELECT * FROM auth_codes WHERE user_id = ?",
      [user_id]
    );

    // 인증 코드가 없는 경우
    if (rows.length === 0) {
      return res
        .status(401)
        .json({ error: "Invalid or expired authentication code" });
    }

    const { code: savedCode, expires_at } = rows[0];

    // 만료된 인증 코드인지 확인
    if (new Date() > new Date(expires_at)) {
      return res.status(401).json({ error: "Authentication code expired" });
    }

    // 입력한 코드와 저장된 코드 비교
    if (authCode !== savedCode) {
      return res.status(401).json({ error: "Invalid authentication code" });
    }

    // 인증 성공, JWT 발급
    const token = jwt.sign({ user_id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error verifying reset code:", error);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (connection) await connection.end(); // 연결 종료
  }
});

/**
 * @swagger
 * /company/reset-password:
 *   post:
 *     tags: [Company]
 *     summary: 비밀번호 변경
 *     description: 비밀번호 변경
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer [Access Token]
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: body
 *         description: 비밀번호 변경
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             user_id:
 *               type: string
 *             new_password:
 *               type: string
 *     responses:
 *       200:
 *         description: 비밀번호 변경
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Database error
 * */
router.post("/reset-password", verifyToken, async (req, res) => {
  const { user_id, new_password } = req.body;

  // 필수 필드 확인
  if (!user_id || !new_password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let connection;
  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig);

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // 사용자 ID로 비밀번호 업데이트 (req.user에 user_id가 포함되어 있다고 가정)
    await connection.execute(
      "UPDATE company SET password = ? WHERE user_id = ?",
      [hashedPassword, user_id]
    );

    // 성공 응답
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Error resetting password" });
  } finally {
    if (connection) await connection.end(); // 연결 종료
  }
});

/**
 * @swagger
 * /company/user-info:
 *   get:
 *     tags: [Company]
 *     summary: 사용자 정보 조회
 *     description: 사용자 정보 조회
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer [Access Token]
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 *
 *       404:
 *         description: 사용자를 찾을 수 없는 경우
 *       500:
 *         description: Database error
 */
router.get("/user-info", verifyToken, async (req, res) => {
  const user = req.user; // verifyToken에서 설정한 userId 사용

  console.log("user_id:", req.user.id);

  let connection;
  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.query(
      "SELECT * FROM company WHERE user_id = ?",
      [user.id]
    ); // users 테이블에서 정보 조회

    if (rows.length > 0) {
      res.status(200).json(rows[0]); // 사용자 정보를 반환
    } else {
      res.status(404).json({ error: "User not found" }); // 사용자를 찾을 수 없는 경우
    }
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).json({ error: "Database connection error" });
    return;
  }
});

/**
 * @swagger
 * /company/generate-history/{pk}:
 *   get:
 *     tags: [Company]
 *     summary: 생성 이력 조회
 *     description: 생성 이력 조회
 *     parameters:
 *       - in: path
 *         name: pk
 *         description: company_pk
 *         required: true
 *         schema:
 *           type: string
 *         example: 1
 *       - in: header
 *         name: Authorization
 *         description: Bearer [Access Token]
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 생성 이력 조회
 *       500:
 *         description: Database error
 *       401:
 *         description: Unauthorized
 */
router.get("/generate-history/:pk", verifyToken, async (req, res) => {
  const licensePk = req.params.pk;

  console.log("user_id:", req.params.pk);

  let connection;
  try {
    // Create a database connection
    connection = await mysql.createConnection(dbConfig);

    // Execute the query
    const [rows] = await connection.query(
      "SELECT * FROM generate_history WHERE company_pk = ?",
      [licensePk]
    );

    if (rows.length > 0) {
      res.status(200).json(rows); // Return the records
    } else {
      res.status(404).json({ error: "No records found" }); // No records found
    }
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).json({ error: "Database connection error" });
  } finally {
    if (connection) {
      await connection.end(); // Close the connection
    }
  }
});

router.put("/history-cancel/:id", verifyToken, async (req, res) => {
  const id = req.params.id; // URL에서 history id를 가져옵니다.

  let connection;
  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig);

    // 이력 변경 쿼리
    const updateQuery = `
      UPDATE generate_history
      SET canceled = 1
      WHERE id = ?
    `;

    // 업데이트 쿼리 실행
    await connection.execute(updateQuery, [id]);

    res.status(200).json({ message: "License canceled successfully" });
  } catch (error) {
    console.error("Error updating license count:", error);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (connection) await connection.end(); // 연결 종료
  }
});

module.exports = router;

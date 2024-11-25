require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs"); // 비밀번호 해싱을 위한 패키지 불러오기
const bodyParser = require("body-parser"); // json 파싱
const router = express.Router();
const cors = require("cors"); // cors 패키지 불러오기
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const admin = require("firebase-admin");
const { verifyToken, generateToken } = require("../controller/auth");
const { getConnection } = require("../controller/mysql");
const {
  generateRandomCode,
  generateUniqueCopyValue,
  formatDateTime,
} = require("../controller/common");
const { sendSESVerifyEmail } = require("../controller/mailer");
router.use(cors());
router.use(bodyParser.json());

var serviceAccount = require("../serviceAccountKey.json");
// Firebase Admin 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

/**
 * @swagger
 * tags:
 *   name: Company
 *   description: 회사 정보 관련 API
 */

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
 *         description: 로그인 실패
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal Server error
 */
router.post("/login", async (req, res) => {
  const { user_id, password } = req.body;

  if (!user_id || !password) {
    return res.status(400).json({ error: "user_id and password are required" });
  }

  let connection;
  try {
    // 데이터베이스 연결
    connection = await getConnection();

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
    const token = await generateToken(user);

    // 로그인 성공
    res.status(200).json({
      message: "Login successful",
      userId: user.id,
      token: token,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) await connection.release(); // 연결 종료
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
 *       403:
 *         description: Unauthorized
 * */
router.get("/list", verifyToken, async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.query("SELECT * FROM company"); // 'your_table_name'을 실제 테이블 이름으로 변경
    res.status(200).json(rows);
  } catch (error) {
    console.error("MySQL query error: ", error);
    res.status(500).json({ error: "Database query error" });
  } finally {
    if (connection) await connection.release(); // 연결 종료
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
 * */
router.post("/add", async (req, res) => {
  const {
    user_id,
    password = "default",
    email,
    company_name,
    user_name,
    address,
    phone,
    provider = 0,
  } = req.body;

  console.log(
    user_id,
    password,
    email,
    company_name,
    user_name,
    address,
    phone,
    provider
  );

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
    connection = await getConnection();

    // 데이터 삽입 쿼리 실행
    const query = `
        INSERT INTO company (user_id, password, email, company_name, user_name, address, phone, unique_code, provider)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      provider,
    ]);

    // 성공 응답
    res.status(200).json({
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
    if (connection) await connection.release(); // 연결 종료
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
 *             permission_flag:
 *               type: string
 *               description: permission_flag
 *             productList:
 *               type: string
 *               description: 선택된 제품 목록
 *     responses:
 *       200:
 *         description: company table data 변경
 *       401:
 *         description: User not found
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Database error
 *       403:
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
    productList = undefined, // 추가된 필드: 선택된 제품 목록
  } = req.body;

  // 필수 필드가 누락된 경우 에러 응답
  if (
    !user_id ||
    !email ||
    !company_name ||
    !user_name ||
    !address ||
    !phone ||
    !unique_code
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let connection;
  try {
    // 데이터베이스 연결
    connection = await getConnection();

    // 수정할 데이터가 있는지 확인
    const [existingUser] = await connection.execute(
      "SELECT * FROM company WHERE id = ?",
      [id]
    );
    if (existingUser.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    // 데이터 수정 쿼리 실행 (productList 필드 추가)
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
          permission_flag = COALESCE(?, permission_flag),
          product = COALESCE(?, product)  
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
      productList, // productList 값도 로그에 추가
      id
    );

    // 제품 목록을 JSON 형식으로 DB에 삽입
    await connection
      .execute(query, [
        user_id,
        email,
        company_name,
        user_name,
        address,
        phone,
        unique_code,
        permission_flag,
        JSON.stringify(productList), // JSON 형식으로 저장
        id,
      ])
      .then((result) => {
        // 성공 응답
        res.status(200).json({ message: "User updated successfully" });
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        res.status(405).json({ error: "DB Error" });
        return;
      });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) await connection.release(); // 연결 종료
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
 *         description: User ID is available
 *       401:
 *         description: User ID already exists
 *       500:
 *         description: Database error
 * */
router.get("/check-user-id/:user_id", async (req, res) => {
  const userId = req.params.user_id; // URL에서 user_id를 가져옵니다.

  console.log(userId);

  let connection;
  try {
    // 데이터베이스 연결
    connection = await getConnection();

    console.log(userId);

    // user_id 존재 여부 확인
    const [results] = await connection.execute(
      "SELECT * FROM company WHERE user_id = ?",
      [userId]
    );

    console.log(results);

    // user_id가 존재하는 경우
    if (results.length > 0) {
      return res.status(401).json({ message: "User ID already exists" });
    } else {
      // user_id가 존재하지 않는 경우
      return res.status(200).json({ message: "User ID is available" });
    }
  } catch (error) {
    console.error("Error checking user ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) await connection.release(); // 연결 종료
  }
});

router.post("/check-user-email", async (req, res) => {
  const { email, user_id } = req.body; // URL에서 user_id를 가져옵니다.

  let connection;
  try {
    // 데이터베이스 연결
    connection = await getConnection();

    console.log(email, user_id);

    // user_id 존재 여부 확인
    const [existEmail] = await connection.execute(
      "SELECT * FROM company WHERE email = ? OR user_id = ?",
      [email, user_id]
    );

    // 회원가입이 되어있는 경우
    const [successUser] = await connection.execute(
      "SELECT * FROM company WHERE email = ? AND user_id = ?",
      [email, user_id]
    );

    console.log(existEmail, successUser);

    // user_id가 존재하는 경우
    if (successUser.length === 0 && existEmail.length > 0) {
      // 회원가입 된 유저가 없고 이미 가입된 이메일이라 회원가입도 안되는 경우 - 에러
      return res.status(401).json({ message: "User Email already exists" });
    } else if (successUser.length > 0) {
      // 회원가입 된 유저가 있는 경우 - 로그인 성공
      return res.status(200).json({ message: "Login Success" });
    } else if (existEmail.length === 0 && successUser.length === 0) {
      // user_id가 존재하지 않는 경우 - 회원가입 가능
      return res.status(201).json({ message: "User Email is available" });
    }
  } catch (error) {
    console.error("Error checking user ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) await connection.release(); // 연결 종료
  }
});

router.post("/account-validate", async (req, res) => {
  const { user_id, email, phone } = req.body;

  console.log(user_id, email, phone);

  let connection;
  try {
    // 데이터베이스 연결
    connection = await getConnection();

    const [isEmail] = await connection.execute(
      "SELECT * FROM company WHERE email = ?",
      [email]
    );

    const [isPhone] = await connection.execute(
      "SELECT * FROM company WHERE phone = ?",
      [phone]
    );

    const [isId] = await connection.execute(
      "SELECT * FROM company WHERE user_id = ?",
      [user_id]
    );

    if (isId.length > 0) {
      return res.status(401).json({ message: "User ID already exists" });
    }

    if (isEmail.length > 0) {
      return res.status(401).json({ message: "Email already exists" });
    }

    if (isPhone.length > 0) {
      return res.status(401).json({ message: "Phone already exists" });
    }

    return res.status(200).json({ message: "Account is available" });
  } catch (error) {
    console.error("Error checking account:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) await connection.release(); // 연결 종료
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
 *       401:
 *         description: User not found
 *       403:
 *         description: Unauthorized
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
      .json({ error: "Missing required field license_cnt" });
  }

  let connection;
  try {
    // 데이터베이스 연결
    connection = await getConnection();

    // user_id 존재 여부 확인
    const [existingUser] = await connection.execute(
      "SELECT license_cnt FROM company WHERE id = ?",
      [id]
    );
    if (existingUser.length === 0) {
      return res.status(401).json({ error: "User not found" });
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
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) await connection.release(); // 연결 종료
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
 *       - in: path
 *         name: id
 *         description: company pk
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: 사용자 삭제
 *       401:
 *         description: User not found
 *       403:
 *         description: Unauthorized
 *       500:
 *         description: Database error
 * */
router.delete("/delete/:id", verifyToken, async (req, res) => {
  const id = req.params.id; // URL에서 id를 가져옵니다.

  let connection;
  try {
    // 데이터베이스 연결
    connection = await getConnection();

    // generate history가 있으면 삭제시킵니다.
    const deleteQuery = "DELETE FROM generate_history WHERE company_pk = ?";
    await connection.execute(deleteQuery, [id]);

    // id 존재 여부 확인
    const [existingUser] = await connection.execute(
      "SELECT * FROM company WHERE id = ?",
      [id]
    );
    if (existingUser.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const { unique_code, user_id } = existingUser[0];
    console.log(unique_code, user_id);

    // 라이센스 히스토리도 지웁니다.
    const deleteLicenseHistoryQuery =
      "DELETE FROM license_history WHERE unique_code = ?";
    await connection.execute(deleteLicenseHistoryQuery, [unique_code]);

    // LicenseManagement에서 연결된 레코드 삭제
    const deleteLicenseQuery =
      "DELETE FROM LicenseManagement WHERE UniqueCode = ?";
    await connection.execute(deleteLicenseQuery, [unique_code]);
    console.log("LicenseManagement entries deleted successfully");

    // id로 행 삭제
    await connection.execute("DELETE FROM company WHERE id = ?", [id]);

    // 성공 응답
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) await connection.release(); // 연결 종료
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
    connection = await getConnection();

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

    // 고유한 user_id와 unique_code 생성
    userData.user_id = await generateUniqueCopyValue(
      connection,
      "user_id",
      userData.user_id
    );
    userData.unique_code = await generateRandomCode();
    userData.license_cnt = 0;

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
      .status(200)
      .json({ message: "User copied successfully", data: userData });
  } catch (error) {
    console.error("Error copying user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) await connection.release(); // 연결 종료
  }
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
    connection = await getConnection();

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

    // 인증 코드의 만료 시간을 설정 (예: 5분 후)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 인증 코드 DB에 저장 (기존의 코드를 업데이트하거나 새로 삽입)
    await connection.execute(
      "INSERT INTO auth_codes (user_id, code, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE code = ?, expires_at = ?",
      [user_id, authCode, expiresAt, authCode, expiresAt]
    );

    // 이메일로 인증 코드 전송
    await sendSESVerifyEmail(email, "Your Authentication Code", authCode)
      .then((result) => {
        console.log("Email sent:", result);
        res.status(200).json({ message: "Authentication code sent to email" });
      })
      .catch((err) => {
        console.error("Error sending email:", err);
        res.status(402).json({ error: "Failed to send email" });
      });
  } catch (error) {
    console.error("Error requesting reset code:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) await connection.release(); // 연결 종료
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
 *       403:
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
    // 인증 코드 생성
    const authCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6자리 랜덤 숫자

    // 인증 코드의 만료 시간을 설정 (예: 5분 후)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 데이터베이스 연결
    connection = await getConnection();

    // 이미 존재하는 이메일인지 확인
    const [rows] = await connection.execute(
      "SELECT * FROM company WHERE email = ?",
      [email]
    );

    console.log(rows);

    if (rows.length > 0) {
      res.status(403).json({ error: "Email already exists" });
      return;
    }

    // 인증 코드 DB에 저장 (기존의 코드를 업데이트하거나 새로 삽입)
    await connection.execute(
      "INSERT INTO auth_codes (user_id, code, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE code = ?, expires_at = ?",
      [user_id, authCode, expiresAt, authCode, expiresAt]
    );

    // 이메일로 인증 코드 전송
    await sendSESVerifyEmail(email, "Your Authentication Code", authCode)
      .then((result) => {
        console.log("Email sent:", result);
        // 성공 응답
        res.status(200).json({ message: "Authentication code sent to email" });
      })
      .catch((err) => {
        console.error("Error sending email:", err);
        res.status(402).json({ error: "Failed to send email" });
        return;
      });
  } catch (error) {
    console.error("Error requesting reset code:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) await connection.release(); // 연결 종료
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
 *         description: Invalid or expired authentication code
 *       500:
 *         description: Database error
 * */
router.post("/verify-code", async (req, res) => {
  const { user_id, authCode } = req.body;

  // 필수 필드 확인
  if (!user_id || !authCode) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let connection;
  try {
    // 데이터베이스 연결
    connection = await getConnection();

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
    const token = await generateToken({ user_id });

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error verifying reset code:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) await connection.release(); // 연결 종료
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
    connection = await getConnection();

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
    if (connection) await connection.release(); // 연결 종료
  }
});

/**
 * @swagger
 * /company/user-info:
 *   get:
 *     tags: [Company]
 *     summary: 사용자 정보 조회
 *     description: 사용자 정보 조회
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

  // if (!pool) {
  //   return res.status(500).json({ error: "Database connection error" });
  // }

  let connection;
  try {
    // 데이터베이스 연결
    connection = await getConnection();

    const [rows] = await connection.query(
      "SELECT * FROM company WHERE id = ?",
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

  if (connection) {
    await connection.release();
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
 *     responses:
 *       200:
 *         description: 생성 이력 조회
 *       500:
 *         description: Database error
 *       403:
 *         description: Unauthorized
 */
router.get("/generate-history/:pk", verifyToken, async (req, res) => {
  const licensePk = req.params.pk;
  let connection;
  try {
    // Create a database connection
    connection = await getConnection();

    // Execute the query
    const [rows] = await connection.query(
      "SELECT * FROM generate_history WHERE company_pk = ?",
      [licensePk]
    );

    let newArr = [];

    for (let i = 0; i < rows.length; i++) {
      if (rows[i].source && rows[i].target) {
        const [source] = await connection.query(
          "SELECT user_name, id FROM company WHERE id = ?",
          [rows[i].source]
        );
        const [target] = await connection.query(
          "SELECT user_name, id FROM company WHERE id = ?",
          [rows[i].target]
        );

        if (source.length === 0) {
          newArr.push({
            ...rows[i],
            source: "Unknown",
            target: target[0].user_name,
            source_id: -1,
            target_id: target[0].id,
          });
        } else if (target.length === 0) {
          newArr.push({
            ...rows[i],
            source: source[0].user_name,
            target: "Unknown",
            source_id: source[0].id,
            target_id: -1,
          });
        } else {
          newArr.push({
            ...rows[i],
            source: source[0].user_name,
            target: target[0].user_name,
            source_id: source[0].id,
            target_id: target[0].id,
          });
        }

        console.log(source, target);
      } else {
        newArr.push(rows[i]);
      }
    }

    console.log(newArr);

    if (rows.length > 0) {
      res.status(200).json(newArr);
    } else {
      res.status(404).json({ error: "History not found" });
    }
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) {
      await connection.release(); // Close the connection
    }
  }
});

/**
 * @swagger
 * /company/history-cancel/{id}:
 *   put:
 *     tags: [Company]
 *     summary: generate license 취소
 *     description: generate license 취소
 *     parameters:
 *       - in: path
 *         name: id
 *         description: history id
 *         required: true
 *         schema:
 *           type: string
 *         example: 1
 *     responses:
 *       200:
 *         description: generate license 취소 완료
 *       500:
 *         description: Database error
 *       403:
 *         description: Unauthorized
 * */
router.put("/history-cancel/:id", verifyToken, async (req, res) => {
  const id = req.params.id; // URL에서 history id를 가져옵니다.

  let connection;
  try {
    // 데이터베이스 연결
    connection = await getConnection();

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
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) await connection.release(); // 연결 종료
  }
});

/**
 * @swagger
 * /company/available-transfer/{unique_code}:
 *   get:
 *     tags: [Company]
 *     summary: 사용자 정보 이관
 *     description: 사용자 정보 이관
 *     parameters:
 *       - in: path
 *         name: unique_code
 *         description: unique_code
 *         required: true
 *         schema:
 *           type: string
 *         example: "RADISENTECH"
 *     responses:
 *       200:
 *         description: 사용자 정보 이관
 *       500:
 *         description: Database error
 *       403:
 *         description: Unauthorized
 * */
router.get(
  "/available-transfer/:unique_code",
  verifyToken,
  async (req, res) => {
    const uniqueCode = req.params.unique_code;
    let connection;
    try {
      // 데이터베이스 연결
      connection = await getConnection();

      // company 목록 중 unique code가 동일한 리스트만 가지고옴
      const [rows] = await connection.query(
        "SELECT * FROM company WHERE unique_code = ?",
        [uniqueCode]
      );
      res.status(200).json(rows);
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({
        status: "error",
        message: "Database error",
        error: error.message,
      });
    } finally {
      // 데이터베이스 연결 해제
      if (connection) await connection.release();
    }
  }
);

/**
 * @swagger
 * /company/get-remain-cnt/{UniqueCode}:
 *   get:
 *     tags: [Company]
 *     summary: 라이센스 수량 반환
 *     description: 유니크 코드로 발급된 라이센스 수량 반환
 *     parameters:
 *       - in: path
 *         name: UniqueCode
 *         description: UniqueCode
 *         required: true
 *         schema:
 *           type: string
 *         example: "RADISENTECH"
 *     responses:
 *       200:
 *         description: 반환 성공
 *       500:
 *         description: Database error
 *       403:
 *         description: Unauthorized
 * */
router.get("/get-remain-cnt/:unique_code", async (req, res) => {
  const uniqueCode = req.params.unique_code;
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.query(
      "SELECT license_cnt FROM company WHERE unique_code = ?",
      [uniqueCode]
    );

    const [rows2] = await connection.query(
      "SELECT * FROM LicenseManagement WHERE UniqueCode = ?",
      [uniqueCode]
    );

    let usedCnt = rows2.length;

    res.status(200).json({
      remain_cnt: rows[0].license_cnt - usedCnt,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      status: "error",
      message: "Database error",
      error: error.message,
    });
  } finally {
    if (connection) await connection.release();
  }
});

/**
 * @swagger
 * /company/transfer:
 *   post:
 *     tags: [Company]
 *     summary: 사용자 정보 이관
 *     description: 사용자 정보 이관
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 사용자 정보 이관 from -> to ID
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             sourceId:
 *               type: integer
 *               description: source user id
 *             targetId:
 *               type: integer
 *               description: target user id
 *     responses:
 *       200:
 *         description: 사용자 정보 이관 완료
 *       500:
 *         description: Database error
 *       403:
 *         description: Unauthorized
 * */
router.post("/transfer", verifyToken, async (req, res) => {
  const { sourceId, targetId } = req.body;

  let connection;
  try {
    // 데이터베이스 연결
    connection = await getConnection();

    console.log("sourceId:", sourceId, "targetId:", targetId);

    // sourceId와 targetId의 유저 정보 조회
    const [sourceUser] = await connection.execute(
      "SELECT unique_code, license_cnt, id FROM company WHERE id = ?",
      [sourceId]
    );
    const [targetUser] = await connection.execute(
      "SELECT unique_code, license_cnt, id FROM company WHERE id = ?",
      [targetId]
    );

    // sourceId와 targetId의 license_cnt 변경
    await connection.execute(
      "UPDATE company SET license_cnt = ? WHERE id = ?",
      [sourceUser[0].license_cnt, targetId]
    );

    await connection.execute(
      "UPDATE company SET license_cnt = ? WHERE id = ?",
      [targetUser[0].license_cnt, sourceId]
    );

    if (sourceUser.length === 0) {
      return res.status(404).json({ error: "Source user not found" });
    }
    if (targetUser.length === 0) {
      return res.status(404).json({ error: "Target user not found" });
    }

    const sourceUniqueCode = sourceUser[0].unique_code;
    const targetUniqueCode = targetUser[0].unique_code;

    // generate_history의 company_pk 업데이트
    const updateGenerateHistory = `UPDATE generate_history SET company_pk = ? WHERE company_pk = ?`;
    await connection.execute(updateGenerateHistory, [targetId, sourceId]);

    console.log("generate_history transferred!");

    // generate history에 이관내역 저장 - target 쪽 / source 쪽
    const insertGenerateHistory = `INSERT INTO generate_history (create_time, description, company_pk, prev_cnt, new_cnt, canceled, source, target)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const nowDate = formatDateTime(new Date());

    console.log(sourceUser, targetUser);

    await connection.execute(insertGenerateHistory, [
      nowDate,
      "Transfer",
      sourceId,
      sourceUser[0].license_cnt,
      0, // 몰수
      0,
      sourceUser[0].id,
      targetUser[0].id,
    ]);

    console.log("license_history transferred!!");

    // 모두 이관을 하고나서 source user의 unique code를 재발급(리셋)
    // await connection.execute(
    //   "UPDATE company SET unique_code = ? WHERE id = ?",
    //   [generateRandomCode(), sourceId]
    // );

    res.status(200).json({
      message: "User data transferred successfully from source to target",
    });
  } catch (error) {
    console.error("Error transferring user data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) await connection.release();
  }
});

router.post("/transfer-cancel", verifyToken, async (req, res) => {
  const { sourceId, targetId } = req.body;

  let connection;
  try {
    // 데이터베이스 연결
    connection = await getConnection();

    console.log("sourceId:", sourceId, "targetId:", targetId);

    // sourceId와 targetId의 유저 정보 조회
    const [sourceUser] = await connection.execute(
      "SELECT unique_code, license_cnt, id FROM company WHERE id = ?",
      [sourceId]
    );
    const [targetUser] = await connection.execute(
      "SELECT unique_code, license_cnt, id FROM company WHERE id = ?",
      [targetId]
    );

    if (sourceUser.length === 0) {
      return res.status(404).json({ error: "Source user not found" });
    }
    if (targetUser.length === 0) {
      return res.status(404).json({ error: "Target user not found" });
    }

    const sourceUniqueCode = sourceUser[0].unique_code;
    const targetUniqueCode = targetUser[0].unique_code;

    // generate_history에서 해당 Transfer 내역을 취소 처리
    const cancelTransfer = `UPDATE generate_history SET canceled = 1 WHERE source = ? AND target = ? AND canceled = 0`;
    await connection.execute(cancelTransfer, [sourceId, targetId]);

    console.log("generate_history entry marked as canceled!");

    // 원래 license_cnt 값으로 복구
    await connection.execute(
      "UPDATE company SET license_cnt = ? WHERE id = ?",
      [sourceUser[0].license_cnt, targetId]
    );
    await connection.execute(
      "UPDATE company SET license_cnt = ? WHERE id = ?",
      [targetUser[0].license_cnt, sourceId]
    );

    // 취소 내역을 기록
    const nowDate = formatDateTime(new Date());
    const insertRevertHistory = `INSERT INTO generate_history (create_time, description, company_pk, prev_cnt, new_cnt, canceled, source, target)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    await connection.execute(insertRevertHistory, [
      nowDate,
      "Transfer Canceled",
      sourceId, // company_pk는 원래 targetId로 기록
      sourceUser[0].license_cnt, // 이전의 source 라이선스 수량
      targetUser[0].license_cnt, // 취소 후 target 라이선스 수량
      1,
      targetUser[0].id, // 원래 target
      sourceUser[0].id, // 원래 source
    ]);

    console.log("Transfer cancellation recorded in history.");

    // generate-history 복구
    await connection.execute(
      "UPDATE generate_history SET company_pk = ? WHERE company_pk = ?",
      [sourceId, targetId]
    );

    // 원래의 unique-code 복구
    await connection.execute(
      "UPDATE company SET unique_code = ? WHERE id = ?",
      [sourceUniqueCode, targetId]
    );

    // 원래의 unique-code 복구
    await connection.execute(
      "UPDATE company SET unique_code = ? WHERE id = ?",
      [targetUniqueCode, sourceId]
    );

    res.status(200).json({
      message: "Transfer has been successfully canceled and data reverted.",
    });
  } catch (error) {
    console.error("Error canceling transfer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) await connection.release();
  }
});

router.get("/reset-unique-code/:id", async (req, res) => {
  const id = req.params.id;

  console.log("id:", id);
  let connection;
  try {
    connection = await getConnection();

    let newCode = await generateRandomCode();
    const [rows] = await connection.query(
      `UPDATE company SET unique_code = ? WHERE id = ?`,
      [newCode, id]
    );
    res.status(200).json({ message: "Unique codes have been reset" });
  } catch (error) {
    console.error("Error resetting unique codes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) await connection.release();
  }
});

router.post("/auth/google", async (req, res) => {
  const { token } = req.body;

  console.log("Received token:", token);
  console.log("Expected client ID:", process.env.GOOGLE_CLIENT_ID);

  try {
    // Google 토큰 검증
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // 정확한 클라이언트 ID로 검증
    });

    const payload = ticket.getPayload();
    console.log("Token Payload:", payload);

    const { sub, name, email, picture } = payload;

    // Firebase Authentication에 사용자 존재 여부 확인
    let userRecord;

    // try {
    //   userRecord = await admin.auth().getUserByEmail(email);
    // } catch (error) {
    //   console.error("Firebase authentication error:", error);
    //   if (error.code === "auth/user-not-found") {
    //     // 사용자 없으면 Firebase에 등록
    //     userRecord = await admin.auth().createUser({
    //       uid: sub,
    //       email,
    //       displayName: name,
    //       photoURL: picture,
    //     });
    //   } else {
    //     throw error; // 다른 오류는 다시 던짐
    //   }
    // }

    // 필요한 경우 사용자 정보를 데이터베이스에 저장
    res.status(200).json({
      message: "Google Login Successful",
      user: {
        id: sub,
        name,
        email,
        picture,
      },
    });
  } catch (error) {
    console.error("Google Login Failed:", error);
    res
      .status(401)
      .json({ message: "Google Login Failed", error: error.message });
  }
});

module.exports = router;

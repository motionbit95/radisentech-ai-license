require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise"); // mysql2 패키지 불러오기
const bcrypt = require("bcrypt"); // 비밀번호 해싱을 위한 패키지 불러오기
const bodyParser = require("body-parser"); // json 파싱
const jwt = require("jsonwebtoken");

const router = express.Router();
const cors = require("cors"); // cors 패키지 불러오기
const { message } = require("antd");
router.use(cors());
router.use(bodyParser.json());

// .env 파일에서 비밀 키 및 포트 가져오기
const JWT_SECRET = process.env.JWT_SECRET;

// MySQL 연결 설정
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// JWT 검증 미들웨어
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

// 로그인 처리 함수
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

// company table list를 불러오는 함수
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

async function generateRandomCode(length = 12) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // 사용할 문자 집합
  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
}

// POST 요청을 받아 데이터를 삽입하는 엔드포인트 생성
router.post("/add", async (req, res) => {
  const { user_id, password, email, company_name, user_name, address, phone } =
    req.body;

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(password, 10);

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
      generateRandomCode(),
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

// PUT 요청을 받아 데이터 수정하는 엔드포인트 생성
router.put("/update/:id", async (req, res) => {
  const id = req.params.id; // URL에서 row id를 가져옵니다.
  const {
    user_id,
    email,
    company_name,
    user_name,
    address,
    phone,
    unique_code,
  } = req.body;

  console.log(req.body);

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
          unique_code = COALESCE(?, unique_code) 
        WHERE id = ?
      `;

    await connection.execute(query, [
      user_id,
      email,
      company_name,
      user_name,
      address,
      phone,
      unique_code,
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

// user_id 중복 체크 엔드포인트 생성
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

// user_id의 license_cnt 값을 기존 값에 합산하여 변경하는 엔드포인트 생성
router.put("/update-license/:user_id", async (req, res) => {
  const userId = req.params.user_id; // URL에서 user_id를 가져옵니다.
  const { license_cnt } = req.body; // body에서 license_cnt 값을 가져옵니다.

  // 필수 필드가 누락된 경우 에러 응답
  if (license_cnt === undefined) {
    return res
      .status(400)
      .json({ error: "Missing required field: license_cnt" });
  }

  let connection;
  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig);

    // user_id 존재 여부 확인
    const [existingUser] = await connection.execute(
      "SELECT license_cnt FROM company WHERE user_id = ?",
      [userId]
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
    const query = "UPDATE company SET license_cnt = ? WHERE user_id = ?";
    await connection.execute(query, [updatedLicenseCnt, userId]);

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

// id로 행을 삭제하는 엔드포인트 생성
router.delete("/delete/:id", async (req, res) => {
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

// 특정 id의 행을 복사하는 엔드포인트 생성
router.post("/copy-user/:id", async (req, res) => {
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
    res.status(201).json({ message: "User copied successfully" });
  } catch (error) {
    console.error("Error copying user:", error);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (connection) await connection.end(); // 연결 종료
  }
});

module.exports = router;

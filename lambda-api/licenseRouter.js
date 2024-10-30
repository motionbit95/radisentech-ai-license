require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise"); // mysql2 패키지 불러오기
const bodyParser = require("body-parser"); // json 파싱
const cors = require("cors");

const router = express.Router();
router.use(cors());
router.use(bodyParser.json());

router.get("/", async (req, res) => {
  res.send("hello");
});

module.exports = router;

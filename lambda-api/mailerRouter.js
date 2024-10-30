require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser"); // json 파싱

const router = express.Router();
const cors = require("cors"); // cors 패키지 불러오기

router.use(cors());
router.use(bodyParser.json());

router.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = router;

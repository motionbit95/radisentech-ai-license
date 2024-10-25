const express = require("express");
const serverless = require("serverless-http");

const app = express();

app.get("/hello", (req, res) => {
  res.send("Hello from Lambda! - updated");
});

module.exports.handler = serverless(app);

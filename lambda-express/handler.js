const express = require("express");
const serverless = require("serverless-http");

const app = express();

// aws access key : AKIAQ4NXP4XZVOZ4XLXG
// aws secret key : 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
// aws account id : arn:aws:iam::061051233779:user/motionbit

app.get("/hello", (req, res) => {
  res.send("Hello from Lambda! - updated");
});

module.exports.handler = serverless(app);

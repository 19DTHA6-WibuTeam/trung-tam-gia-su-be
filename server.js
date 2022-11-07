"use strict";
require("dotenv").config();
const cors = require("cors");
const app = require("express")();
const nocache = require("nocache");
const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
// require("./database/mysql");

const serverHost = "localhost";
const serverPort = process.env.PORT || 3004;

let index = require("./src/routes/index");

app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.set("etag", false);
app.use(nocache());
app.use(fileUpload());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
// app.use(cookieParser());
app.use(function (req, res, next) {
  // res.removeHeader("x-powered-by");
  res.setHeader("X-Powered-By", "from WibuTeam wit luv.");
  next();
});
app.use("/", index);
app.use(function (req, res) {
  res.status(404).send({
    url: req.originalUrl + " not found.",
  });
});

app.listen(serverPort);

console.log(`RESTful API server started on port ${serverPort}`);
console.log(`Listening for traffic @ http://${serverHost}:${serverPort}`);

module.exports = app;

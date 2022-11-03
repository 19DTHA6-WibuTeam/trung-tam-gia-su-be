"use strict";
require("dotenv").config();
const app = require("express")();
const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
// require("./database/mysql");

const serverHost = "localhost";
const serverPort = process.env.PORT || 3004;

let index = require("./src/routes/index");

app.use(fileUpload());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
// app.use(cookieParser());
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

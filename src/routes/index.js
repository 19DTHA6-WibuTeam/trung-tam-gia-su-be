"use strict";
const express = require("express");
const fn = require("../../conf/function");
const router = express.Router();

router.use("/NguoiDung", require("./NguoiDung.route"));
router.use("/ThoiGianHoc", require("./ThoiGianHoc.route"));
router.use("/KhoaHoc", require("./KhoaHoc.route"));

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json({ message: "Welcome to the homepage from WibuTeam." });
});

/* Test Route */
router.get("/test", function (req, res, next) {
  let a = fn.hashMD5(new Date().getTime());
  res.json({
    result: "Test success!",
    data: a,
  });
});

module.exports = router;

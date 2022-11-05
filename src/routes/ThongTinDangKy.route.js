"use strict";
const express = require("express");
const router = express.Router();
const ThongTinDangKyController = require("../controllers/ThongTinDangKy.controller");

router.route("/").get(ThongTinDangKyController.get);

module.exports = router;

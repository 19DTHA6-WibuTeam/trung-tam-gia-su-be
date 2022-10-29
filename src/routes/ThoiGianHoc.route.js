"use strict";
const express = require("express");
const router = express.Router();
const ThoiGianHocController = require("../controllers/ThoiGianHoc.controller");

router.route("/").get(ThoiGianHocController.get);

module.exports = router;

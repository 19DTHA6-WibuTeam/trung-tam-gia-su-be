"use strict";
const express = require("express");
const router = express.Router();
const ThoiKhoaBieuController = require("../controllers/ThoiKhoaBieu.controller");

router.route("/KhoaHoc").get(ThoiKhoaBieuController.getKhoaHoc);
router.route("/").get(ThoiKhoaBieuController.getThoiKhoaBieu);

module.exports = router;

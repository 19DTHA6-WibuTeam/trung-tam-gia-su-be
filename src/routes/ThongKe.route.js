"use strict";
const express = require("express");
const router = express.Router();
const ThongKeController = require("../controllers/ThongKe.controller");

router.route("/").get(ThongKeController.getSummary);
router.route("/:NguoiDung/:MaNguoiDung").get(ThongKeController.getByUser);

module.exports = router;

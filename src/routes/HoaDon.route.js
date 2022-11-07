"use strict";
const express = require("express");
const router = express.Router();
const HoaDonController = require("../controllers/HoaDon.controller");
const fn = require("../../conf/function");

router.route("/").all(fn.verifyAuth).get(HoaDonController.getList);
router
  .route("/NguoiDung/:MaNguoiDung")
  .all(fn.verifyAuth)
  .get(HoaDonController.getByUserId);
router
  .route("/KhoaHoc/:MaKhoaHoc")
  .all(fn.verifyAuth)
  .get(HoaDonController.getByMKH);
router.route("/:MaHoaDon").all(fn.verifyAuth).get(HoaDonController.getById);

module.exports = router;

"use strict";
const express = require("express");
const fn = require("../../conf/function");
const router = express.Router();
const KhoaHocController = require("../controllers/KhoaHoc.controller");

router
  .route("/GiangDay/:MaKhoaHoc")
  .all(fn.verifyAuth)
  .post(KhoaHocController.DangKyDay)
  .delete(KhoaHocController.HuyLichDay);
router
  .route("/TinhTrang/:MaKhoaHoc")
  .all(fn.verifyAuth)
  .post(KhoaHocController.DoiTinhTrang);
router
  .route("/")
  .all(fn.verifyAuth)
  .get(KhoaHocController.getList)
  .post(KhoaHocController.post);
router
  .route("/:MaKhoaHoc")
  .all(fn.verifyAuth)
  .get(KhoaHocController.get)
  .patch(KhoaHocController.update)
  .delete(KhoaHocController.delete);

module.exports = router;

"use strict";
const express = require("express");
const router = express.Router();
const ChuyenMonController = require("../controllers/ChuyenMon.controller");
const fn = require("../../conf/function");

router
  .route("/")
  .all(fn.verifyAuth)
  .get(ChuyenMonController.getList)
  .post(ChuyenMonController.post);
router
  .route("/NguoiDung/:MaNguoiDung")
  .all(fn.verifyAuth)
  .get(ChuyenMonController.getByUserId);
router
  .route("/:MaChuyenMon")
  .all(fn.verifyAuth)
  .get(ChuyenMonController.getById)
  .patch(ChuyenMonController.update)
  .delete(ChuyenMonController.delete);

module.exports = router;

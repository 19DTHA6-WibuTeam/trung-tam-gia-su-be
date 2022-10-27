"use strict";
const express = require("express");
const router = express.Router();
const NguoiDungController = require("../controllers/NguoiDung.controller");
const fn = require("../../conf/function");

// router
//   .route("/")
//   .get(NguoiDungController.listCustomers)
//   .post(NguoiDungController.createCustomer);

router.route("/login").post(NguoiDungController.login);
router.route("/register").post(NguoiDungController.register);
router
  .route("/:MaNguoiDung")
  .all(fn.verifyAuth)
  .get(NguoiDungController.getById)
  .patch(NguoiDungController.update);

module.exports = router;

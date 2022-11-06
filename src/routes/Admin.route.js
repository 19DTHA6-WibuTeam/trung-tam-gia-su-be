"use strict";
const express = require("express");
const fn = require("../../conf/function");
const router = express.Router();
const AdminController = require("../controllers/Admin.controller");

router.route("/KhoaHoc").all(fn.verifyAuth).get(AdminController.getListKhoaHoc);
// router.route("/").get(AdminController.getAdmin);

module.exports = router;

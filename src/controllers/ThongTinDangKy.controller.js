"use strict";
const fn = require("../../conf/function");
const ThongTinDangKy = require("../models/ThongTinDangKy.model");
const ReturnApi = require("../models/returnApi.model");

let controller = {};

controller.get = async (req, res) => {
  let returnApi = new ReturnApi();
  let MonHoc = await ThongTinDangKy.getMonHoc();
  let CaHoc = await ThongTinDangKy.getCaHoc();
  let ThuTrongTuan = await ThongTinDangKy.getThuTrongTuan();
  let SoTienBuoiHoc = await ThongTinDangKy.getSoTienBuoiHoc();
  returnApi.success = true;
  returnApi.data = { MonHoc, CaHoc, ThuTrongTuan, SoTienBuoiHoc };
  res.send(returnApi.toObject());
};

module.exports = controller;

"use strict";
const fn = require("../../conf/function");
const ThoiGianHoc = require("../models/ThoiGianHoc.model");
const ReturnApi = require("../models/returnApi.model");

let controller = {};

controller.get = async (req, res) => {
  let returnApi = new ReturnApi();
  let MonHoc = await ThoiGianHoc.getMonHoc();
  let CaHoc = await ThoiGianHoc.getCaHoc();
  let ThuTrongTuan = await ThoiGianHoc.getThuTrongTuan();
  returnApi.success = true;
  returnApi.data = { MonHoc, CaHoc, ThuTrongTuan };
  res.send(returnApi.toObject());
};

module.exports = controller;

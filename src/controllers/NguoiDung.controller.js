"use strict";
const striptags = require("striptags");
const fn = require("../../conf/function");
const NguoiDung = require("../models/NguoiDung.model");
const ReturnApi = require("../models/returnApi.model");

let controller = {};

controller.getById = async (req, res) => {
  let returnApi = new ReturnApi();
  let { MaNguoiDung } = req.params;
  if (
    req.MaNguoiDung == MaNguoiDung ||
    req.bypass == fn.hmacMD5(req.MaNguoiDung)
  ) {
    let data = await NguoiDung.getById(MaNguoiDung);
    if (data) {
      returnApi.success = true;
      delete data.MatKhau;
      returnApi.data = data;
    } else returnApi.message = "Người dùng không tìm thấy.";
  } else returnApi.message = "Bạn không có quyền truy cập.";
  res.send(returnApi.toObject());
};

controller.login = async (req, res) => {
  let returnApi = new ReturnApi();
  let a = await NguoiDung.login(req.body);
  if (typeof a == "string") returnApi.message = a;
  else {
    returnApi.success = true;
    returnApi.data = a;
  }
  res.send(returnApi.toObject());
};

controller.register = async (req, res) => {
  let returnApi = new ReturnApi();
  let a = await NguoiDung.register(req.body);
  if (typeof a == "string") returnApi.message = a;
  else {
    returnApi.success = true;
    returnApi.data = a;
  }
  res.send(returnApi.toObject());
};

controller.update = async (req, res) => {
  let returnApi = new ReturnApi();
  let { MaNguoiDung } = req.params;
  if (
    req.MaNguoiDung == MaNguoiDung ||
    req.bypass == fn.hmacMD5(req.MaNguoiDung)
  ) {
    let a = await NguoiDung.update(MaNguoiDung, req.body);
    if (typeof a == "string") returnApi.message = a;
    else {
      returnApi.success = true;
      returnApi.data = a;
    }
  } else returnApi.message = "Bạn không có quyền truy cập.";
  res.send(returnApi.toObject());
};

module.exports = controller;

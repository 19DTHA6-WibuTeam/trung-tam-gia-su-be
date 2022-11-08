"use strict";
const jsonwebtoken = require("jsonwebtoken");
const striptags = require("striptags");
const fn = require("../../conf/function");
const NguoiDung = require("../models/NguoiDung.model");
const ReturnApi = require("../models/returnApi.model");

let controller = {};

controller.getList = async (req, res) => {
  let returnApi = new ReturnApi();
  let a = await NguoiDung.getList(req.query.LaGiaSu);
  returnApi.success = true;
  returnApi.data = a;
  res.send(returnApi.toObject());
};

controller.getById = async (req, res) => {
  let returnApi = new ReturnApi();
  let { MaNguoiDung } = req.params;
  let bypass = req.bypass;
  let data = await NguoiDung.getById(MaNguoiDung);
  if (data) {
    returnApi.success = true;
    delete data.MatKhau;
    // returnApi.data = data;
    let payload = { MaNguoiDung: req.MaNguoiDung },
      JWT_PASSWORD = process.env.JWT_PASSWORD;
    if (bypass == JWT_PASSWORD)
      payload = {
        ...payload,
        bypass: fn.hmacMD5(req.MaNguoiDung),
      };
    returnApi.data = {
      ...data,
      token: jsonwebtoken.sign(payload, JWT_PASSWORD, {
        expiresIn: "1d",
      }),
    };
  } else returnApi.message = "Người dùng không tìm thấy.";
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
  if (req.MaNguoiDung == MaNguoiDung || req.bypass) {
    let a = await NguoiDung.update(MaNguoiDung, req.body, req.files);
    if (typeof a == "string") returnApi.message = a;
    else {
      returnApi.success = true;
      returnApi.data = a;
    }
  } else returnApi.message = "Bạn không có quyền truy cập.";
  res.send(returnApi.toObject());
};

controller.DoiMatKhau = async (req, res) => {
  let returnApi = new ReturnApi();
  let { MatKhauCu, MatKhauMoi } = req.body;
  let a = await NguoiDung.DoiMatKhau(req.MaNguoiDung, MatKhauCu, MatKhauMoi);
  if (typeof a == "string") returnApi.message = a;
  else {
    returnApi.success = true;
    returnApi.data = a;
  }
  res.send(returnApi.toObject());
};

controller.DangKyGiaSu = async (req, res) => {
  let returnApi = new ReturnApi();
  let a = await NguoiDung.DangKyGiaSu(req.params.MaNguoiDung, req.bypass);
  if (typeof a == "string") returnApi.message = a;
  else {
    returnApi.success = true;
    returnApi.message = "Đăng ký gia sư thành công!";
    returnApi.data = a;
  }
  res.send(returnApi.toObject());
};

controller.checkSession = (req, res) => {
  let returnApi = new ReturnApi();
  returnApi.success = true;
  returnApi.message = "Yahoo.";
  res.send(returnApi.toObject());
};

module.exports = controller;

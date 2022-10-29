"use strict";
const fn = require("../../conf/function");
const KhoaHoc = require("../models/KhoaHoc.model");
const ReturnApi = require("../models/returnApi.model");

let controller = {};

controller.getList = async (req, res) => {
  let returnApi = new ReturnApi();
  let { k, v } = req.query;
  let a = await KhoaHoc.getList(k, v);
  returnApi.success = true;
  returnApi.data = a;
  res.send(returnApi.toObject());
};

controller.get = async (req, res) => {
  let returnApi = new ReturnApi();
  let a = await KhoaHoc.getById(req.params.MaKhoaHoc);
  if (typeof a == "string") returnApi.message = a;
  else {
    returnApi.success = true;
    returnApi.data = a;
  }
  res.send(returnApi.toObject());
};

controller.post = async (req, res) => {
  let returnApi = new ReturnApi();
  let a = await KhoaHoc.post({ ...req.body, MaHocSinh: req.MaNguoiDung });
  if (typeof a == "string") returnApi.message = a;
  else {
    returnApi.success = true;
    returnApi.message = "Đã đăng khoá học thành công.";
    returnApi.data = a;
  }
  res.send(returnApi.toObject());
};

controller.update = async (req, res) => {
  let returnApi = new ReturnApi();
  let a = await KhoaHoc.update(req.params.MaKhoaHoc, req.body);
  if (typeof a == "string") returnApi.message = a;
  else {
    returnApi.success = true;
    returnApi.message = "Đã cập nhật khoá học thành công.";
    returnApi.data = a;
  }
  res.send(returnApi.toObject());
};

controller.delete = async (req, res) => {
  let returnApi = new ReturnApi();
  let a = await KhoaHoc.delete(req.params.MaKhoaHoc);
  if (typeof a == "string") returnApi.message = a;
  else {
    returnApi.success = true;
    returnApi.message = "Đã xoá khoá học thành công.";
    returnApi.data = a;
  }
  res.send(returnApi.toObject());
};

module.exports = controller;
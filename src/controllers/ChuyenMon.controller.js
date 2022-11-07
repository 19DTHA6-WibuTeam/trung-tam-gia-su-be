"use strict";
const fn = require("../../conf/function");
const ChuyenMon = require("../models/ChuyenMon.model");
const ReturnApi = require("../models/returnApi.model");

let controller = {};

controller.getList = async (req, res) => {
  let returnApi = new ReturnApi();
  let data = await ChuyenMon.getList();
  returnApi.success = true;
  returnApi.data = data;
  res.send(returnApi.toObject());
};

controller.getById = async (req, res) => {
  let returnApi = new ReturnApi();
  let data = await ChuyenMon.getById(req.params.MaChuyenMon);
  returnApi.success = true;
  returnApi.data = data;
  res.send(returnApi.toObject());
};

controller.getByUserId = async (req, res) => {
  let returnApi = new ReturnApi();
  let data = await ChuyenMon.getByUserId(req.params.MaNguoiDung);
  returnApi.success = true;
  returnApi.data = data;
  res.send(returnApi.toObject());
};

controller.post = async (req, res) => {
  let returnApi = new ReturnApi();
  let a = await ChuyenMon.post(req.MaNguoiDung, req.body, req.files);
  if (typeof a == "string") returnApi.message = a;
  else {
    returnApi.success = true;
    returnApi.message = "Đã thêm chuyên môn.";
    returnApi.data = a;
  }
  res.send(returnApi.toObject());
};

controller.update = async (req, res) => {
  let returnApi = new ReturnApi();
  let a = await ChuyenMon.update(
    req.MaNguoiDung,
    req.params.MaChuyenMon,
    req.body,
    req.files
  );
  if (typeof a == "string") returnApi.message = a;
  else {
    returnApi.success = true;
    returnApi.message = "Đã cập nhật chuyên môn.";
    returnApi.data = a;
  }
  res.send(returnApi.toObject());
};

controller.delete = async (req, res) => {
  let returnApi = new ReturnApi();
  let a = await ChuyenMon.delete(
    req.MaNguoiDung,
    req.params.MaChuyenMon,
    req.bypass ? true : false
  );
  if (typeof a == "string") returnApi.message = a;
  else {
    returnApi.success = true;
    returnApi.message = "Đã xoá chuyên môn.";
    returnApi.data = a;
  }
  res.send(returnApi.toObject());
};

module.exports = controller;

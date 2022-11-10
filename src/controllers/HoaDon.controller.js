"use strict";
const fn = require("../../conf/function");
const HoaDon = require("../models/HoaDon.model");
const ReturnApi = require("../models/returnApi.model");

let controller = {};

controller.getList = async (req, res) => {
  let returnApi = new ReturnApi();
  let data = await HoaDon.getList();
  returnApi.success = true;
  returnApi.data = data;
  res.send(returnApi.toObject());
};

controller.getById = async (req, res) => {
  let returnApi = new ReturnApi();
  let data = await HoaDon.getById(req.params.MaHoaDon);
  if (data && data.TinhTrang == 0)
    data.LinkThanhToan = fn.payment(req.query.returnUrl, {
      MaHoaDon: data.MaNguoiDung + "." + data.MaHoaDon,
      SoTien: data.SoTien,
      NoiDung: data.GhiChu,
      ip: req.query.ip,
    });
  returnApi.success = true;
  returnApi.data = data;
  res.send(returnApi.toObject());
};

controller.getByUserId = async (req, res) => {
  let returnApi = new ReturnApi();
  let data = await HoaDon.getByUserId(req.params.MaNguoiDung);
  returnApi.success = true;
  returnApi.data = data;
  res.send(returnApi.toObject());
};

controller.getByMKH = async (req, res) => {
  let returnApi = new ReturnApi();
  let data = await HoaDon.getByMKH(req.params.MaKhoaHoc);
  returnApi.success = true;
  returnApi.data = data;
  res.send(returnApi.toObject());
};

controller.XacNhanThanhToan = async (req, res) => {
  let returnApi = new ReturnApi();
  let a = await HoaDon.XacNhanThanhToan(req.params.MaHoaDon, req.query);
  if (typeof a == "string") returnApi.message = a;
  else {
    returnApi.success = true;
    returnApi.message = "Đã xác nhận thanh toán thành công.";
    returnApi.data = a;
  }
  res.send(returnApi.toObject());
};

controller.ThanhToan = async (req, res) => {
  let returnApi = new ReturnApi();
  let a = await HoaDon.ThanhToan(
    req.params.MaHoaDon,
    req.query.TinhTrang,
    req.bypass
  );
  if (typeof a == "string") returnApi.message = a;
  else {
    returnApi.success = true;
    returnApi.message = "Đã xác nhận thanh toán thành công.";
    returnApi.data = a;
  }
  res.send(returnApi.toObject());
};

module.exports = controller;

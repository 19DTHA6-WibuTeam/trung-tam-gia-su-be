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

module.exports = controller;

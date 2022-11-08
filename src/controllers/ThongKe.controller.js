"use strict";
const fn = require("../../conf/function");
const ThongKe = require("../models/ThongKe.model");
const ReturnApi = require("../models/returnApi.model");

let controller = {};

controller.getSummary = async (req, res) => {
  let returnApi = new ReturnApi();
  let data = await ThongKe.getSummary();
  returnApi.success = true;
  returnApi.data = data;
  res.send(returnApi.toObject());
};

controller.getByUser = async (req, res) => {
  let returnApi = new ReturnApi();
  let data = await ThongKe.getByUser(
    req.params.NguoiDung,
    req.params.MaNguoiDung
  );
  returnApi.success = true;
  returnApi.data = data;
  res.send(returnApi.toObject());
};

module.exports = controller;

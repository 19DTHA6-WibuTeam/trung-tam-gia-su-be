"use strict";
const fn = require("../../conf/function");
const ThoiKhoaBieu = require("../models/ThoiKhoaBieu.model");
const ReturnApi = require("../models/returnApi.model");

let controller = {};

controller.getListKhoaHoc = async (req, res) => {
  let returnApi = new ReturnApi();
  let { k, v } = req.query;
  let data = await ThoiKhoaBieu.getListKhoaHoc(k, v);
  returnApi.success = true;
  returnApi.data = data;
  res.send(returnApi.toObject());
};

module.exports = controller;

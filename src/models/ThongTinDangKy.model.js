const { pool } = require("../../database/mysql");

let model = {};

model.getMonHoc = function () {
  return new Promise((resolve) => {
    pool.query("SELECT * FROM MonHoc", (err, results) => {
      if (err) console.log(err);
      resolve(results);
    });
  });
};

model.getCaHoc = function () {
  return new Promise((resolve) => {
    pool.query("SELECT * FROM CaHoc", (err, results) => {
      if (err) console.log(err);
      resolve(results);
    });
  });
};

model.getThuTrongTuan = function () {
  return new Promise((resolve) => {
    pool.query("SELECT * FROM ThuTrongTuan", (err, results) => {
      if (err) console.log(err);
      resolve(results);
    });
  });
};

model.getSoTienBuoiHoc = function () {
  return new Promise((resolve) => {
    pool.query("SELECT * FROM SoTienBuoiHoc", (err, results) => {
      if (err) console.log(err);
      resolve(results);
    });
  });
};

module.exports = model;

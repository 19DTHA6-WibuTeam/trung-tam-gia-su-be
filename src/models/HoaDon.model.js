const { pool } = require("../../database/mysql");

let model = {};

model.getList = function () {
  return new Promise((resolve) => {
    pool.query(
      "SELECT * FROM HoaDon ORDER BY MaHoaDon DESC",
      (err, results) => {
        if (err) console.log(err);
        resolve(results);
      }
    );
  });
};

model.getById = function (MaHoaDon) {
  return new Promise((resolve) => {
    pool.query(
      "SELECT * FROM HoaDon WHERE MaHoaDon = ?",
      MaHoaDon,
      (err, results) => {
        if (err) console.log(err);
        resolve(results);
      }
    );
  });
};

model.getByUserId = function (MaNguoiDung) {
  return new Promise((resolve) => {
    pool.query(
      "SELECT * FROM HoaDon WHERE MaNguoiDung = ?",
      MaNguoiDung,
      (err, results) => {
        if (err) console.log(err);
        resolve(results);
      }
    );
  });
};

module.exports = model;

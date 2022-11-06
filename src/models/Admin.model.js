const { pool } = require("../../database/mysql");

let model = {};

model.getListKhoaHoc = function (key, value) {
  return new Promise((resolve) => {
    pool.query(
      "SELECT * FROM KhoaHoc ORDER BY MaKhoaHoc DESC",
      ["KH." + key, value],
      (err, results) => {
        if (err) console.log(err);
        resolve(results);
      }
    );
  });
};

module.exports = model;

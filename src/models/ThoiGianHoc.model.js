const mysqlConn = require("../../database/mysql");

let model = {};

model.getCaHoc = function () {
  return new Promise((resolve) => {
    mysqlConn.query("SELECT * FROM CaHoc", (err, results) => {
      if (err) console.log(err);
      resolve(results);
    });
  });
};

model.getThuTrongTuan = function () {
  return new Promise((resolve) => {
    mysqlConn.query("SELECT * FROM ThuTrongTuan", (err, results) => {
      if (err) console.log(err);
      resolve(results);
    });
  });
};

module.exports = model;

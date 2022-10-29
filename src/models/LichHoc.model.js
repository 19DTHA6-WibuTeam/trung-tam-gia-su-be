const moment = require("moment");
const fn = require("../../conf/function");
const mysqlConn = require("../../database/mysql");

let model = {};

model.getList = function (key, value) {
  return new Promise((resolve) => {
    mysqlConn.query(
      "SELECT * FROM LichHoc WHERE ?? = ? ORDER BY MaLichHoc DESC",
      [key, value],
      (err, results) => {
        if (err) console.log(err);
        resolve(results);
      }
    );
  });
};

model.getById = async function (MaLichHoc) {
  let a = await model.getList("MaLichHoc", MaLichHoc);
  if (a.length) return a[0];
  else return null;
};

model.post = function () {};

model.update = function (MaLichHoc) {};

model.delete = async function (MaLichHoc) {
  let a = await model.getById("MaLichHoc", MaLichHoc);
  if (a.length) {
    let b = a[0];
    if (b.MaGiaSu)
      return "Lịch học này đang được thực hiện. Vui lòng liên hệ quản trị để trao đổi.";
    return "";
  }
  return "Không tồn tại lịch học.";
};

module.exports = model;

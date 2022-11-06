const { pool } = require("../../database/mysql");

let model = {};

model.getThoiKhoaBieu = function (key, value) {
  return new Promise((resolve) => {
    pool.query(
      "SELECT KH.MaKhoaHoc, KH.HoTen, KH.DiaChi, KH.SDT, KH.NgayBatDau, KH.SoTuan, DATE_ADD(KH.NgayBatDau, INTERVAL (KH.SoTuan * 7 - 1) DAY) AS NgayKetThuc, MH.TenMonHoc, CH.*, TTT.* FROM ThoiKhoaBieu TKB LEFT JOIN KhoaHoc KH ON TKB.MaKhoaHoc = KH.MaKhoaHoc LEFT JOIN MonHoc MH ON KH.MaMonHoc = MH.MaMonHoc LEFT JOIN CaHoc CH ON TKB.MaCaHoc = CH.MaCaHoc LEFT JOIN ThuTrongTuan TTT ON TKB.MaThu = TTT.MaThu WHERE ?? = ? AND KH.TinhTrang = 2",
      ["KH." + key, value],
      (err, results) => {
        if (err) console.log(err);
        resolve(results);
      }
    );
  });
};

model.getKhoaHoc = function (key, value) {
  return new Promise((resolve) => {
    pool.query(
      "SELECT KH.MaKhoaHoc, MH.TenMonHoc, KH.NgayBatDau, KH.SoTuan, DATE_ADD(KH.NgayBatDau, INTERVAL (KH.SoTuan * 7 - 1) DAY) AS NgayKetThuc FROM KhoaHoc KH LEFT JOIN MonHoc MH ON MH.MaMonHoc = KH.MaMonHoc WHERE ?? = ? AND KH.TinhTrang = 2",
      ["KH." + key, value],
      (err, results) => {
        if (err) console.log(err);
        resolve(results);
      }
    );
  });
};

module.exports = model;

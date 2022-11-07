const { pool } = require("../../database/mysql");

let model = {};

model.getList = function () {
  return new Promise((resolve) => {
    pool.query(
      "SELECT HD.*, ND.HoTen, ND.Email, ND.SDT FROM HoaDon HD LEFT JOIN NguoiDung ND ON HD.MaNguoiDung = ND.MaNguoiDung ORDER BY HD.MaHoaDon DESC",
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
      "SELECT HD.*, MH.TenMonHoc, KH.NgayBatDau, KH.SoTien AS SoTienMotBuoi, KH.SoTuan, COUNT(HD.MaHoaDon) AS SoBuoi, ND.HoTen, ND.Email, ND.SDT FROM HoaDon HD LEFT JOIN NguoiDung ND ON HD.MaNguoiDung = ND.MaNguoiDung LEFT JOIN KhoaHoc KH ON HD.MaKhoaHoc = KH.MaKhoaHoc LEFT JOIN MonHoc MH ON KH.MaMonHoc = MH.MaMonHoc LEFT JOIN ThoiKhoaBieu TKB ON KH.MaKhoaHoc = TKB.MaKhoaHoc WHERE HD.MaHoaDon = ? GROUP BY HD.MaHoaDon",
      MaHoaDon,
      (err, results) => {
        if (err) console.log(err);
        resolve(results.length > 0 ? results[0] : {});
      }
    );
  });
};

model.getByUserId = function (MaNguoiDung) {
  return new Promise((resolve) => {
    pool.query(
      "SELECT HD.*, ND.HoTen, ND.Email, ND.SDT FROM HoaDon HD LEFT JOIN NguoiDung ND ON HD.MaNguoiDung = ND.MaNguoiDung WHERE HD.MaNguoiDung = ? ORDER BY HD.MaHoaDon DESC",
      MaNguoiDung,
      (err, results) => {
        if (err) console.log(err);
        resolve(results);
      }
    );
  });
};

model.getByMKH = function (MaKhoaHoc) {
  return new Promise((resolve) => {
    pool.query(
      "SELECT HD.*, ND.HoTen, ND.Email, ND.SDT, ND.DiaChi FROM HoaDon HD LEFT JOIN NguoiDung ND ON HD.MaNguoiDung = ND.MaNguoiDung WHERE HD.MaKhoaHoc = ? ORDER BY HD.LoaiPhieu ASC",
      MaKhoaHoc,
      (err, results) => {
        if (err) console.log(err);
        resolve(results);
      }
    );
  });
};

module.exports = model;

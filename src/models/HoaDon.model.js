const moment = require("moment");
const KhoaHoc = require("../models/KhoaHoc.model");
const fn = require("../../conf/function");
const { pool, connection } = require("../../database/mysql");

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

model.getById = async function (MaHoaDon) {
  return new Promise((resolve) => {
    pool.query(
      "SELECT HD.*, ND.HoTen, ND.Email, ND.SDT FROM HoaDon HD LEFT JOIN NguoiDung ND ON HD.MaNguoiDung = ND.MaNguoiDung WHERE HD.MaHoaDon = ? GROUP BY HD.MaHoaDon",
      MaHoaDon,
      async (err, results) => {
        if (err) console.log(err);
        // resolve(results.length > 0 ? results[0] : {});
        if (results.length) {
          let result = results[0];
          if (result.MaKhoaHoc)
            result.KhoaHoc = await KhoaHoc.getById(result.MaKhoaHoc);
          resolve(result);
        } else resolve({});
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

model.XacNhanThanhToan = async function (MaHoaDon, query) {
  let a = await model.getById(MaHoaDon);
  if (a) {
    let MaGiaoDich = null,
      verify = fn.verifyTransaction(query);
    if (verify.success)
      if (verify.data.orderId.includes(a.MaNguoiDung + "." + a.MaHoaDon)) {
        MaGiaoDich = verify.data.vnpTranId;

        let conn = await connection();
        try {
          await conn.beginTransaction();

          await conn.query(
            "UPDATE HoaDon SET TinhTrang = 1, NgayThanhToan = ?, MaGiaoDich = ? WHERE MaHoaDon = ?",
            [moment().format("YYYY-MM-DD"), MaGiaoDich, MaHoaDon]
          );

          await conn.commit();
          await conn.release();
          return verify.data;
        } catch (err) {
          console.log(err);
          await conn.rollback();
          await conn.release();
          return "Có lỗi xảy ra, vui lòng thử lại.";
        }
      } else return "Giao dịch không chính xác.";
    else return verify.message;
  } else return "Không tìm thấy hoá đơn.";
};

model.ThanhToan = async function (MaHoaDon, TinhTrang, bypass) {
  let a = await model.getById(MaHoaDon);
  if (a) {
    if (bypass) {
      let conn = await connection();
      try {
        await conn.beginTransaction();

        let b = await conn.query(
          "UPDATE HoaDon SET TinhTrang = ?, NgayThanhToan = ? WHERE MaHoaDon = ?",
          [TinhTrang ? 1 : 0, moment().format("YYYY-MM-DD"), MaHoaDon]
        );

        await conn.commit();
        await conn.release();
        return b;
      } catch (err) {
        console.log(err);
        await conn.rollback();
        await conn.release();
        return "Có lỗi xảy ra, vui lòng thử lại.";
      }
    } else return "Bạn không có quyền truy cập.";
  } else return "Không tìm thấy hoá đơn.";
};

module.exports = model;

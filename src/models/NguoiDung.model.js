const jsonwebtoken = require("jsonwebtoken");
const moment = require("moment");
const fn = require("../../conf/function");
const mysqlConn = require("../../database/mysql");

let model = {};

model.getById = function (value, key = "MaNguoiDung") {
  return new Promise((resolve) => {
    mysqlConn.query(
      "SELECT * FROM NguoiDung WHERE ?? = ?",
      [key, value],
      (err, results) => {
        if (err) console.log(err);
        resolve(results ? results[0] : null);
      }
    );
  });
};

model.login = async function (body) {
  let { Email, TenDangNhap, MatKhau, bypass } = body;
  if (!Email || !MatKhau) return "Thiếu thông tin.";
  var result = await model.getById(
    TenDangNhap || Email,
    TenDangNhap ? "TenDangNhap" : "Email"
  );
  if (result) {
    if (fn.verifyPassword(MatKhau, result.MatKhau)) {
      let payload = { MaNguoiDung: result.MaNguoiDung },
        JWT_PASSWORD = process.env.JWT_PASSWORD;
      if (bypass == JWT_PASSWORD)
        payload = {
          ...payload,
          bypass: fn.hmacMD5(result.MaNguoiDung),
        };
      return {
        token: jsonwebtoken.sign(payload, JWT_PASSWORD, {
          expiresIn: "1d",
        }),
      };
    } else return "Thông tin đăng nhập không chính xác.";
  }
  return "Tài khoản không tìm thấy.";
};

model.register = function (body) {
  let { HoTen, NgaySinh, GioiTinh, DiaChi, SDT, Email, MatKhau } = body;
  if (!HoTen || !NgaySinh || !GioiTinh || !DiaChi || !SDT || !Email || !MatKhau)
    return "Thiếu thông tin.";
  return new Promise(async (resolve) => {
    let a = await model.getById(Email, "Email");
    if (!a)
      mysqlConn.query(
        "INSERT INTO NguoiDung(HoTen, NgaySinh, GioiTinh, DiaChi, SDT, Email, MatKhau, NgayTao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          HoTen,
          NgaySinh,
          GioiTinh,
          DiaChi,
          SDT,
          Email,
          fn.hashPassword(MatKhau),
          moment().format("YYYY-MM-DD"),
        ],
        (err, results) => {
          if (err) console.log(err);
          resolve(results);
        }
      );
    else resolve("Tài khoản đã tồn tại.");
  });
};

model.update = async function (MaNguoiDung, body) {
  let { HoTen, NgaySinh, GioiTinh, DiaChi, SDT, Email, MatKhau } = body;
  let sql = "UPDATE NguoiDung SET ",
    isChanged = false;
  if (HoTen) {
    sql += "HoTen = " + mysqlConn.escape(HoTen) + ",";
    isChanged = true;
  }
  if (NgaySinh) {
    sql += "NgaySinh = " + mysqlConn.escape(NgaySinh) + ",";
    isChanged = true;
  }
  if (GioiTinh) {
    sql += "GioiTinh = " + mysqlConn.escape(GioiTinh) + ",";
    isChanged = true;
  }
  if (DiaChi) {
    sql += "DiaChi = " + mysqlConn.escape(DiaChi) + ",";
    isChanged = true;
  }
  if (SDT) {
    sql += "SDT = " + mysqlConn.escape(SDT) + ",";
    isChanged = true;
  }
  if (Email) {
    sql += "Email = " + mysqlConn.escape(Email) + ",";
    isChanged = true;
  }
  if (MatKhau) {
    sql += "MatKhau = " + mysqlConn.escape(fn.hashPassword(MatKhau)) + ",";
    isChanged = true;
  }
  if (isChanged) {
    sql =
      sql.substring(0, sql.length - 1) +
      " WHERE MaNguoiDung = " +
      mysqlConn.escape(MaNguoiDung);
    let a = await model.getById(MaNguoiDung, "MaNguoiDung");
    if (a)
      return new Promise((resolve) => {
        mysqlConn.query(sql, (err, results) => {
          if (err) console.log(err);
          resolve(results);
        });
      });
    else return "Tài khoản không tìm thấy";
  }
};

module.exports = model;

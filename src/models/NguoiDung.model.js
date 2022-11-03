const jsonwebtoken = require("jsonwebtoken");
const moment = require("moment");
const fn = require("../../conf/function");
const { pool } = require("../../database/mysql");

let model = {};

model.getById = function (value, key = "MaNguoiDung") {
  return new Promise((resolve) => {
    pool.query(
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
      delete result.MatKhau;
      return {
        ...result,
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
      pool.query(
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

model.update = async function (MaNguoiDung, body, files = null) {
  let { HoTen, NgaySinh, GioiTinh, DiaChi, SDT, Email, MatKhau } = body,
    Avatar = "";
  let sql = "UPDATE NguoiDung SET ",
    isChanged = false;
  if (HoTen) {
    sql += "HoTen = " + pool.escape(HoTen) + ",";
    isChanged = true;
  }
  if (NgaySinh) {
    sql += "NgaySinh = " + pool.escape(NgaySinh) + ",";
    isChanged = true;
  }
  if (GioiTinh) {
    sql += "GioiTinh = " + pool.escape(GioiTinh) + ",";
    isChanged = true;
  }
  if (DiaChi) {
    sql += "DiaChi = " + pool.escape(DiaChi) + ",";
    isChanged = true;
  }
  if (SDT) {
    sql += "SDT = " + pool.escape(SDT) + ",";
    isChanged = true;
  }
  if (Email) {
    sql += "Email = " + pool.escape(Email) + ",";
    isChanged = true;
  }
  if (MatKhau) {
    sql += "MatKhau = " + pool.escape(fn.hashPassword(MatKhau)) + ",";
    isChanged = true;
  }

  if (files) {
    let avatar_temp = files.avatar;
    if (avatar_temp.mimetype.includes("image/")) {
      if (avatar_temp.size < 2 * 1024 * 1024) {
        let user = await model.getById(MaNguoiDung);
        let file_name =
          "./temp/" +
          fn.hashMD5(avatar_temp.name + MaNguoiDung) +
          "." +
          avatar_temp.mimetype.replace("image/", "");
        avatar_temp.mv(file_name);
        let img = await fn.uploadImg(file_name, true, user.Avatar);
        if (typeof img.link == "string") Avatar = img.link;
      } else return "File ảnh không được quá 2MB.";
    } else return "File ảnh không hợp lệ!";
  }

  if (Avatar) {
    sql += "Avatar = " + pool.escape(Avatar) + ",";
    isChanged = true;
  }
  if (isChanged) {
    sql =
      sql.substring(0, sql.length - 1) +
      " WHERE MaNguoiDung = " +
      pool.escape(MaNguoiDung);
    let a = await model.getById(MaNguoiDung, "MaNguoiDung");
    if (a)
      return new Promise((resolve) => {
        pool.query(sql, (err, results) => {
          if (err) console.log(err);
          resolve(results);
        });
      });
    else return "Tài khoản không tìm thấy!";
  }
};

module.exports = model;

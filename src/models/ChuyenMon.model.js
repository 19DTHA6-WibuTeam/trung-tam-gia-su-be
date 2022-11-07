const NguoiDungModel = require("../models/NguoiDung.model");
const fn = require("../../conf/function");
const { pool, connection } = require("../../database/mysql");

let model = {};

model.getList = function () {
  return new Promise((resolve) => {
    pool.query(
      "SELECT CM.*, ND.HoTen, MH.TenMonHoc FROM ChuyenMon CM LEFT JOIN NguoiDung ND ON CM.MaNguoiDung = ND.MaNguoiDung LEFT JOIN MonHoc MH ON CM.MaMonHoc = MH.MaMonHoc ORDER BY CM.MaChuyenMon DESC",
      (err, results) => {
        if (err) console.log(err);
        resolve(results);
      }
    );
  });
};

model.getById = function (MaChuyenMon) {
  return new Promise((resolve) => {
    pool.query(
      "SELECT CM.*, ND.HoTen, MH.TenMonHoc FROM ChuyenMon CM LEFT JOIN NguoiDung ND ON CM.MaNguoiDung = ND.MaNguoiDung LEFT JOIN MonHoc MH ON CM.MaMonHoc = MH.MaMonHoc WHERE CM.MaChuyenMon = ?",
      MaChuyenMon,
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
      "SELECT CM.*, ND.HoTen, MH.TenMonHoc FROM ChuyenMon CM LEFT JOIN NguoiDung ND ON CM.MaNguoiDung = ND.MaNguoiDung LEFT JOIN MonHoc MH ON CM.MaMonHoc = MH.MaMonHoc WHERE CM.MaNguoiDung = ? ORDER BY CM.MaChuyenMon DESC",
      MaNguoiDung,
      (err, results) => {
        if (err) console.log(err);
        resolve(results);
      }
    );
  });
};

model.post = async function (MaNguoiDung, body, files = null) {
  let { MaMonHoc, NoiDung } = body;
  if (!MaMonHoc) return "Thiếu thông tin.";
  let a = await NguoiDungModel.getById(MaNguoiDung, "MaNguoiDung");
  if (a.LaGiaSu) {
    let HinhAnh = "";
    if (files) {
      let avatar_temp = files.HinhAnh;
      if (avatar_temp.mimetype.includes("image/")) {
        if (avatar_temp.size < 2 * 1024 * 1024) {
          let file_name =
            "./temp/" +
            fn.hashMD5(avatar_temp.name + MaNguoiDung) +
            "." +
            avatar_temp.mimetype.replace("image/", "");
          avatar_temp.mv(file_name);
          let img = await fn.uploadImg(file_name, true);
          if (typeof img.link == "string") HinhAnh = img.link;
        } else return "File ảnh không được quá 2MB.";
      } else return "File ảnh không hợp lệ!";
    }

    let conn = await connection();
    try {
      await conn.beginTransaction();
      await conn.query(
        "INSERT INTO ChuyenMon(MaNguoiDung, MaMonHoc, NoiDung, HinhAnh) VALUES (?, ?, ?, ?)",
        [
          MaNguoiDung,
          MaMonHoc,
          NoiDung ? NoiDung.trim() : null,
          HinhAnh || null,
        ]
      );
      await conn.commit();
      await conn.release();
      return {};
    } catch (err) {
      console.log(err);
      if (HinhAnh) await fn.deleteImg(HinhAnh);
      await conn.rollback();
      await conn.release();
      return "Có lỗi xảy ra, vui lòng thử lại.";
    }
  } else return "Bạn không phải là gia sư.";
};

model.update = async function (MaNguoiDung, MaChuyenMon, body, files = null) {
  let { MaMonHoc, NoiDung } = body;
  let a = await NguoiDungModel.getById(MaNguoiDung, "MaNguoiDung");
  if (a.LaGiaSu) {
    let b = await model.getById(MaChuyenMon);
    if (b) {
      let sql = "UPDATE ChuyenMon SET ",
        isChanged = false,
        HinhAnh = "";
      if (files) {
        let avatar_temp = files.HinhAnh;
        if (avatar_temp.mimetype.includes("image/")) {
          if (avatar_temp.size < 2 * 1024 * 1024) {
            let file_name =
              "./temp/" +
              fn.hashMD5(avatar_temp.name + MaNguoiDung) +
              "." +
              avatar_temp.mimetype.replace("image/", "");
            avatar_temp.mv(file_name);
            let img = await fn.uploadImg(file_name, true, b.HinhAnh);
            if (typeof img.link == "string") HinhAnh = img.link;
          } else return "File ảnh không được quá 2MB.";
        } else return "File ảnh không hợp lệ!";
      }

      if (MaMonHoc) {
        sql += "MaMonHoc = " + pool.escape(MaMonHoc.trim()) + ",";
        isChanged = true;
      }
      if (NoiDung != undefined) {
        sql +=
          "NoiDung = " + pool.escape(NoiDung ? NoiDung.trim() : null) + ",";
        isChanged = true;
      }
      if (HinhAnh) {
        sql += "HinhAnh = " + pool.escape(HinhAnh) + ",";
        isChanged = true;
      }

      if (isChanged) {
        sql =
          sql.substring(0, sql.length - 1) +
          " WHERE MaChuyenMon = " +
          pool.escape(MaChuyenMon);
        return new Promise((resolve) => {
          pool.query(sql, (err, results) => {
            if (err) {
              console.log(err);
              resolve(err.sqlMessage);
            }
            resolve(results);
          });
        });
      }
    } else return "Không tìm thấy chuyên môn.";
  } else return "Bạn không phải là gia sư.";
};

model.delete = async function (MaNguoiDung, MaChuyenMon, bypass = false) {
  let a = await model.getById(MaChuyenMon);
  if (a && (a.MaNguoiDung == MaNguoiDung || bypass)) {
    let b = await model.getById(MaChuyenMon);
    if (b) {
      // if (b.HinhAnh) await fn.deleteImg(b.HinhAnh);
      // return new Promise((resolve) => {
      //   pool.query(
      //     "DELETE FROM ChuyenMon WHERE MaChuyenMon = ?",
      //     MaChuyenMon,
      //     (err, results) => {
      //       if (err) {
      //         console.log(err);
      //         resolve(err.sqlMessage);
      //       }
      //       resolve(results);
      //     }
      //   );
      // });
      let conn = await connection();
      try {
        await conn.beginTransaction();
        if (b.HinhAnh) await fn.deleteImg(b.HinhAnh);
        await conn.query(
          "DELETE FROM ChuyenMon WHERE MaChuyenMon = ?",
          MaChuyenMon
        );
        await conn.commit();
        await conn.release();
        return {};
      } catch (err) {
        console.log(err);
        if (HinhAnh) await fn.deleteImg(HinhAnh);
        await conn.rollback();
        await conn.release();
        return "Có lỗi xảy ra, vui lòng thử lại.";
      }
    } else return "Không tìm thấy chuyên môn.";
  } else return "Bạn không có quyền xoá chuyên môn này.";
};

module.exports = model;

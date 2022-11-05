const moment = require("moment");
const fn = require("../../conf/function");
const { pool, connection, query } = require("../../database/mysql");

let model = {};

model.getTKB = function (MaKhoaHoc) {
  return new Promise((resolve) => {
    pool.query(
      "SELECT CH.*, TTT.* FROM ThoiKhoaBieu TKB LEFT JOIN CaHoc CH ON TKB.MaCaHoc = CH.MaCaHoc LEFT JOIN ThuTrongTuan TTT ON TKB.MaThu = TTT.MaThu WHERE TKB.MaKhoaHoc = ?",
      MaKhoaHoc,
      (err, results) => {
        if (err) console.log(err);
        resolve(results ?? []);
      }
    );
  });
};

model.getList = function (key, value) {
  return new Promise((resolve) => {
    pool.query(
      "SELECT KH.*, MH.TenMonHoc FROM KhoaHoc KH LEFT JOIN MonHoc MH ON KH.MaMonHoc = MH.MaMonHoc WHERE ?? = ? ORDER BY MaKhoaHoc DESC",
      [key, value],
      async (err, results) => {
        if (err) console.log(err);
        // resolve(results ?? []);
        let data = [];
        for (let i in results) {
          let a = results[i];
          let b = await model.getTKB(a.MaKhoaHoc);
          data = [...data, { ...a, ThoiKhoaBieu: b }];
        }
        resolve(data);
      }
    );
  });
};

model.getById = async function (MaKhoaHoc) {
  let a = await model.getList("MaKhoaHoc", MaKhoaHoc);
  if (a.length) return a[0];
  else return null;
};

model.post = async function (body) {
  let {
    MaMonHoc,
    MaHocSinh,
    KhoiLop,
    HoTen,
    DiaChi,
    SDT,
    SoTuan,
    SoTien,
    GhiChu,
    MaCaHoc,
    MaThu,
  } = body;

  let conn = await connection();
  try {
    await conn.beginTransaction();
    let a = await conn.query(
      "INSERT INTO KhoaHoc(MaMonHoc, MaHocSinh, KhoiLop, HoTen, DiaChi, SDT, NgayDangKy, SoTuan, SoTien, GhiChu) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        MaMonHoc.trim(),
        MaHocSinh,
        KhoiLop.trim(),
        HoTen.trim(),
        DiaChi.trim(),
        SDT.trim(),
        moment().format("YYYY-MM-DD"),
        SoTuan.trim(),
        SoTien.trim(),
        GhiChu ? GhiChu.trim() : null,
      ]
    );
    let MaKhoaHoc = a.insertId;
    let b = MaThu.split(",");
    for (let i in b) {
      if (b[i])
        await conn.query(
          "INSERT INTO ThoiKhoaBieu(MaKhoaHoc, MaCaHoc, MaThu) VALUES (?, ?, ?)",
          [MaKhoaHoc, MaCaHoc, b[i]]
        );
    }
    await conn.commit();
    await conn.release();
    return a;
  } catch (err) {
    console.log(err);
    await conn.rollback();
    await conn.release();
    return "Có lỗi xảy ra, vui lòng thử lại.";
  }
};

model.update = async function (MaKhoaHoc, body) {
  let {
    MaMonHoc,
    KhoiLop,
    HoTen,
    DiaChi,
    SDT,
    SoTuan,
    SoTien,
    GhiChu,
    MaCaHoc,
    MaThu,
  } = body;

  let a = await model.getById(MaKhoaHoc);
  if (a) {
    if (a.MaGiaSu)
      return "Khoá học này đang được thực hiện. Vui lòng liên hệ quản trị để trao đổi.";
    else {
      let sql = "UPDATE KhoaHoc SET ",
        isChanged = false;
      if (MaMonHoc) {
        sql += "MaMonHoc = " + pool.escape(MaMonHoc) + ",";
        isChanged = true;
      }
      if (KhoiLop) {
        sql += "KhoiLop = " + pool.escape(KhoiLop.trim()) + ",";
        isChanged = true;
      }
      if (HoTen) {
        sql += "HoTen = " + pool.escape(HoTen.trim()) + ",";
        isChanged = true;
      }
      if (DiaChi) {
        sql += "DiaChi = " + pool.escape(DiaChi.trim()) + ",";
        isChanged = true;
      }
      if (SDT) {
        sql += "SDT = " + pool.escape(SDT.trim()) + ",";
        isChanged = true;
      }
      if (SoTuan) {
        sql += "SoTuan = " + pool.escape(SoTuan.trim()) + ",";
        isChanged = true;
      }
      if (SoTien) {
        sql += "SoTien = " + pool.escape(SoTien.trim()) + ",";
        isChanged = true;
      }
      if (GhiChu != undefined) {
        sql += "GhiChu = " + pool.escape(GhiChu ? GhiChu.trim() : null) + ",";
        isChanged = true;
      }

      let conn = await connection();
      try {
        await conn.beginTransaction();
        let b = {};
        if (isChanged) {
          sql =
            sql.substring(0, sql.length - 1) +
            " WHERE MaKhoaHoc = " +
            pool.escape(MaKhoaHoc);
          b = await conn.query(sql);
        }
        if (MaCaHoc && MaThu) {
          await conn.query(
            "DELETE FROM ThoiKhoaBieu WHERE MaKhoaHoc = ?",
            MaKhoaHoc
          );
          let c = MaThu.split(",");
          for (let i in c) {
            if (c[i])
              await conn.query(
                "INSERT INTO ThoiKhoaBieu(MaKhoaHoc, MaCaHoc, MaThu) VALUES (?, ?, ?)",
                [MaKhoaHoc, MaCaHoc, c[i]]
              );
          }
        }
        await conn.commit();
        await conn.release();
        return b;
      } catch (err) {
        console.log(err);
        await conn.rollback();
        await conn.release();
        return "Có lỗi xảy ra, vui lòng thử lại.";
      }
    }
  }
  return "Không tồn tại khoá học.";
};

model.delete = async function (MaKhoaHoc) {
  let a = await model.getById(MaKhoaHoc);
  if (a) {
    if (a.MaGiaSu)
      return "Khoá học này đang được thực hiện. Vui lòng liên hệ quản trị để trao đổi.";
    else {
      let conn = await connection();
      try {
        await conn.beginTransaction();
        let b = await conn.query(
          "DELETE FROM ThoiKhoaBieu WHERE MaKhoaHoc = ?",
          MaKhoaHoc
        );
        let c = await conn.query(
          "DELETE FROM KhoaHoc WHERE MaKhoaHoc = ?",
          MaKhoaHoc
        );
        await conn.commit();
        await conn.release();
        return { KhoaHoc: c, ThoiKhoaBieu: b };
      } catch (err) {
        console.log(err);
        await conn.rollback();
        await conn.release();
        return "Có lỗi xảy ra, vui lòng thử lại.";
      }
    }
  }
  return "Không tồn tại khoá học.";
};

module.exports = model;

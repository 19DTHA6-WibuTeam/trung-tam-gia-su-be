const moment = require("moment");
const NguoiDungModel = require("../models/NguoiDung.model");
const { pool, connection, query } = require("../../database/mysql");
const fn = require("../../conf/function");

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

model.getList = function (key = null, value = null, search = {}) {
  let sql =
      "SELECT KH.*, MH.TenMonHoc FROM KhoaHoc KH LEFT JOIN MonHoc MH ON KH.MaMonHoc = MH.MaMonHoc ",
    { HoTen, SDT, TinhTrang, orderby_ID, pn } = search;
  if (key && value) sql += "WHERE ?? = ?";
  else if (search) {
    sql_search = "";
    if (HoTen)
      sql_search +=
        "MATCH (KH.HoTen) AGAINST (" + pool.escape(HoTen) + ") AND ";
    if (SDT) sql_search += "KH.SDT = " + pool.escape(SDT) + " AND ";
    if (TinhTrang)
      sql_search += "KH.TinhTrang = " + pool.escape(TinhTrang) + " AND ";

    if (sql_search)
      sql += "WHERE " + sql_search.substring(0, sql_search.length - 5);
  }
  sql +=
    " ORDER BY MaKhoaHoc " +
    (orderby_ID == "ASC" ? "ASC" : "DESC") +
    fn.Offset(pn);
  return new Promise((resolve) => {
    pool.query(sql, [key, value], async (err, results) => {
      if (err) console.log(err);
      // resolve(results ?? []);
      let data = [];
      for (let i in results) {
        let a = results[i];
        let b = await model.getTKB(a.MaKhoaHoc);
        let c = {
          MaCaHoc: b[0].MaCaHoc,
          GioBatDau: b[0].GioBatDau,
          GioKetThuc: b[0].GioKetThuc,
          MaThu: "",
          TenThu: "",
        };
        for (let j in b) {
          c.MaThu = [...c.MaThu, b[j].MaThu];
          c.TenThu = [...c.TenThu, b[j].TenThu];
        }
        c.MaThu = c.MaThu.join(",");
        c.TenThu = c.TenThu.join(", ");
        data = [...data, { ...a, ThoiKhoaBieu: b, ThoiKhoaBieu_TomTat: c }];
      }
      resolve(data);
    });
  });
};

model.getById = async function (MaKhoaHoc) {
  let a = await model.getList("MaKhoaHoc", MaKhoaHoc);
  if (a.length) return a[0];
  else return null;
};

let sqlIsDuplicateTKB =
  "SELECT TKB.MaKhoaHoc, TKB.MaCaHoc, GROUP_CONCAT(TKB.MaThu SEPARATOR ',') AS MaThu FROM KhoaHoc KH LEFT JOIN ThoiKhoaBieu TKB ON KH.MaKhoaHoc = TKB.MaKhoaHoc WHERE ?? = ? AND TKB.MaCaHoc = ? AND KH.TinhTrang < 3 GROUP BY TKB.MaKhoaHoc, TKB.MaCaHoc";
model.isDuplicateTKB = async function (
  key = "MaHocSinh",
  v,
  MaCaHoc,
  MaThu = []
) {
  return new Promise((resolve) => {
    pool.query(sqlIsDuplicateTKB, ["KH." + key, v, MaCaHoc], (err, results) => {
      for (let i in results)
        for (let j in MaThu)
          if (results[i].MaThu.includes(MaThu[j])) {
            resolve(true);
            break;
          }
      resolve(false);
    });
  });
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

  let MaThu_arr = MaThu.trim().split(",");
  let check = await model.isDuplicateTKB(
    "MaHocSinh",
    MaHocSinh,
    MaCaHoc.trim(),
    MaThu_arr
  );
  if (check) return "Bị trùng lịch, vui lòng kiểm tra lại!";

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
    for (let i in MaThu_arr) {
      if (MaThu_arr[i])
        await conn.query(
          "INSERT INTO ThoiKhoaBieu(MaKhoaHoc, MaCaHoc, MaThu) VALUES (?, ?, ?)",
          [MaKhoaHoc, MaCaHoc.trim(), MaThu_arr[i]]
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
    if (a.MaGiaSu || a.TinhTrang >= 2)
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
          sql += "TinhTrang = 0,";
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

          let MaThu_arr = MaThu.trim().split(",");
          let check = false;
          let results = await conn.query(sqlIsDuplicateTKB, [
            "KH.MaHocSinh",
            a.MaHocSinh,
            MaCaHoc.trim(),
          ]);
          for (let i in results)
            for (let j in MaThu_arr)
              if (results[i].MaThu.includes(MaThu_arr[j])) {
                check = true;
                break;
              }
          if (check) {
            await conn.rollback();
            await conn.release();
            return "Bị trùng lịch, vui lòng kiểm tra lại!";
          }

          for (let i in MaThu_arr) {
            if (MaThu_arr[i])
              await conn.query(
                "INSERT INTO ThoiKhoaBieu(MaKhoaHoc, MaCaHoc, MaThu) VALUES (?, ?, ?)",
                [MaKhoaHoc, MaCaHoc, MaThu_arr[i]]
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
    if (a.MaGiaSu || a.TinhTrang >= 2)
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

model.DangKyDay = async function (MaGiaSu, MaKhoaHoc) {
  let a = await NguoiDungModel.getById(MaGiaSu);
  if (a.LaGiaSu == 0) return "Bạn không phải là gia sư.";
  let b = await model.getById(MaKhoaHoc);
  if (b) {
    if (b.MaGiaSu || b.TinhTrang >= 2)
      return "Khoá học này đã được đăng ký dạy trước đó.";
    else {
      // let c = await model.getList("MaGiaSu", MaGiaSu);
      let MaThu_arr = b.ThoiKhoaBieu_TomTat.MaThu.split(",");
      let check = await model.isDuplicateTKB(
        "MaGiaSu",
        MaGiaSu,
        b.ThoiKhoaBieu_TomTat.MaCaHoc,
        MaThu_arr
      );
      if (check) return "Bị trùng lịch, vui lòng kiểm tra lại!";

      let conn = await connection();
      try {
        await conn.beginTransaction();

        let c = await conn.query(
          "UPDATE KhoaHoc SET MaGiaSu = ?, NgayBatDau = ?, TinhTrang = 2 WHERE MaKhoaHoc = ?",
          [
            MaGiaSu,
            fn.getMonday(moment().add(7, "days").format("YYYY-MM-DD")),
            MaKhoaHoc,
          ]
        );
        let SoTien = b.SoTien * b.SoTuan * MaThu_arr.length,
          NgayTao = moment().format("YYYY-MM-DD");
        await conn.query(
          "INSERT INTO HoaDon(MaNguoiDung, MaKhoaHoc, LoaiPhieu, TinhTrang, SoTien, GhiChu, NgayTao) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            b.MaHocSinh,
            MaKhoaHoc,
            1,
            0,
            SoTien,
            "Học phí mã khoá học #" + MaKhoaHoc,
            NgayTao,
          ]
        );
        await conn.query(
          "INSERT INTO HoaDon(MaNguoiDung, MaKhoaHoc, LoaiPhieu, TinhTrang, SoTien, GhiChu, NgayTao) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            MaGiaSu,
            MaKhoaHoc,
            2,
            0,
            SoTien - (SoTien * 20) / 100,
            "Tiền lương mã khoá học #" + MaKhoaHoc,
            NgayTao,
          ]
        );

        await conn.commit();
        await conn.release();
        return c;
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

model.HuyLichDay = async function (MaGiaSu, MaKhoaHoc, deleteHoaDon = false) {
  let a = await NguoiDungModel.getById(MaGiaSu);
  if (a.LaGiaSu == 0) return "Bạn không phải là gia sư.";
  let b = await model.getById(MaKhoaHoc);
  if (b) {
    let conn = await connection();
    try {
      await conn.beginTransaction();

      let c = await conn.query(
        "UPDATE KhoaHoc SET MaGiaSu = ?, NgayBatDau = ?, TinhTrang = 1 WHERE MaKhoaHoc = ?",
        [null, null, MaKhoaHoc]
      );
      if (deleteHoaDon == true)
        await conn.query("DELETE FROM HoaDon WHERE MaKhoaHoc = ?", MaKhoaHoc);

      await conn.commit();
      await conn.release();
      return c;
    } catch (err) {
      console.log(err);
      await conn.rollback();
      await conn.release();
      return "Có lỗi xảy ra, vui lòng thử lại.";
    }
  }
  return "Không tồn tại khoá học.";
};

model.DoiTinhTrang = async function (MaGiaSu, MaKhoaHoc) {
  let a = await NguoiDungModel.getById(MaGiaSu);
  if (a.LaGiaSu == 0) return "Bạn không phải là gia sư.";
  let b = await model.getById(MaKhoaHoc);
  if (b) {
    let conn = await connection();
    try {
      await conn.beginTransaction();

      let c = await conn.query(
        "UPDATE KhoaHoc SET TinhTrang = ? WHERE MaKhoaHoc = ?",
        [b.TinhTrang == 1 ? 0 : 1, MaKhoaHoc]
      );

      await conn.commit();
      await conn.release();
      return c;
    } catch (err) {
      console.log(err);
      await conn.rollback();
      await conn.release();
      return "Có lỗi xảy ra, vui lòng thử lại.";
    }
  }
  return "Không tồn tại khoá học.";
};

module.exports = model;

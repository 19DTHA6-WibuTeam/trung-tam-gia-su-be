const { pool, connection } = require("../../database/mysql");

let model = {};

model.getSummary = async function () {
  let conn = await connection();
  try {
    await conn.beginTransaction();

    let a = await conn.query(
        "SELECT TinhTrang, COUNT(*) AS SoLuong FROM KhoaHoc GROUP BY TinhTrang ORDER BY TinhTrang ASC"
      ),
      kh = {},
      TongKhoaHoc = 0;
    for (let i = 0; i <= 3; i++) {
      let flag = false;
      for (let j in a) {
        if (i == a[j].TinhTrang) {
          flag = true;
          kh["tt_" + i] = a[j].SoLuong;
          TongKhoaHoc += a[j].SoLuong;
          break;
        }
      }
      if (flag == false && !kh["tt_" + i]) kh["tt_" + i] = 0;
    }
    kh.TongKhoaHoc = TongKhoaHoc;

    let b = await conn.query(
        "SELECT LaGiaSu, COUNT(*) AS SoLuong FROM NguoiDung GROUP BY LaGiaSu ORDER BY LaGiaSu ASC"
      ),
      nd = {},
      TongNguoiDung = 0;
    for (let i = 0; i <= 1; i++) {
      let flag = false;
      for (let j in b) {
        if (i == b[j].LaGiaSu) {
          flag = true;
          nd["nd_" + i] = b[j].SoLuong;
          TongNguoiDung += b[j].SoLuong;
          break;
        }
      }
      if (flag == false && !nd["nd_" + i]) nd["nd_" + i] = 0;
    }
    nd.TongNguoiDung = TongNguoiDung;

    let c = await conn.query(
        "SELECT SUM(SoTien) AS SoTien FROM HoaDon WHERE LoaiPhieu = 1 UNION SELECT SUM(SoTien) FROM HoaDon WHERE LoaiPhieu = 2"
      ),
      TongTien = 0;
    TongTien = c[0].SoTien - c[1].SoTien;

    let d = await conn.query(
      "SELECT COUNT(*) AS SoLuong FROM HoaDon WHERE LoaiPhieu = 1 AND TinhTrang = 0"
    );

    await conn.commit();
    await conn.release();
    return {
      KhoaHoc: kh,
      NguoiDung: nd,
      DoanhThu: TongTien,
      HoaDon: { ChuaThanhToan: d[0].SoLuong },
    };
  } catch (err) {
    console.log(err);
    await conn.rollback();
    await conn.release();
    return "Có lỗi xảy ra, vui lòng thử lại.";
  }
};

model.getByUser = async function (NguoiDung, MaNguoiDung) {
  let conn = await connection();
  try {
    await conn.beginTransaction();

    let sql;
    if (NguoiDung == "HocSinh")
      sql =
        "SELECT TinhTrang, COUNT(*) AS SoLuong FROM KhoaHoc WHERE MaHocSinh = ? GROUP BY TinhTrang ORDER BY TinhTrang ASC";
    else if (NguoiDung == "GiaSu")
      sql =
        "SELECT TinhTrang, COUNT(*) AS SoLuong FROM KhoaHoc WHERE MaGiaSu = ? GROUP BY TinhTrang ORDER BY TinhTrang ASC";
    let a = await conn.query(sql, MaNguoiDung),
      kh = {},
      TongKhoaHoc = 0;
    for (let i = 0; i <= 3; i++) {
      let flag = false;
      for (let j in a) {
        if (i == a[j].TinhTrang) {
          flag = true;
          kh["tt_" + i] = a[j].SoLuong;
          TongKhoaHoc += a[j].SoLuong;
          break;
        }
      }
      if (flag == false && !kh["tt_" + i]) kh["tt_" + i] = 0;
    }
    kh.TongKhoaHoc = TongKhoaHoc;

    await conn.commit();
    await conn.release();
    return { KhoaHoc: kh };
  } catch (err) {
    console.log(err);
    await conn.rollback();
    await conn.release();
    return "Có lỗi xảy ra, vui lòng thử lại.";
  }
};

module.exports = model;

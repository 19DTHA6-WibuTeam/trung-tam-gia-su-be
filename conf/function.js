const bcrypt = require("bcrypt");
const crypto = require("crypto");
const querystring = require("qs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { ImgurClient } = require("imgur");
const ReturnApi = require("../src/models/returnApi.model");

const imgurClient = new ImgurClient({
  clientId: process.env.IMGUR_CLIENT_ID,
  clientSecret: process.env.IMGUR_CLIENT_SECRET,
  refreshToken: process.env.IMGUR_REFRESH_TOKEN,
});

let fn = {};

fn.isNumeric = function (str) {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
};

fn.addMinToTime = function (time, min) {
  let t = time.split(":");
  let oldDate = new Date();
  oldDate.setHours(~~t[0], ~~t[1], 00, 00);
  let newDate = new Date(oldDate.getTime() + min * 60 * 1000);
  return newDate.getHours() + ":" + newDate.getMinutes() + ":00";
};

fn.getMonday = function (d) {
  d = new Date(d);
  var day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  var new_day = new Date(d.setDate(diff));
  var date = new_day.getDate();
  date = date < 10 ? "0" + date : date;
  var month = new_day.getMonth() + 1;
  month = month < 10 ? "0" + month : month;
  return new_day.getFullYear() + "-" + month + "-" + date;
};

fn.hashMD5 = function (str) {
  str = String(str);
  return crypto.createHash("md5").update(str).digest("hex");
};

fn.hmacMD5 = function (str) {
  str = String(str);
  return crypto
    .createHmac("md5", process.env.JWT_PASSWORD)
    .update(str)
    .digest("hex");
};

fn.hashPassword = function (password) {
  return bcrypt.hashSync(password, 10);
};

fn.verifyPassword = function (password, hash) {
  return bcrypt.compareSync(password, hash);
};

fn.parseToken = function (token) {
  try {
    return jwt.verify(token, process.env.JWT_PASSWORD);
  } catch (err) {
    return {};
  }
};

fn.verifyAuth = async function (req, res, next) {
  let returnApi = new ReturnApi();
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    var parse = fn.parseToken(token);
    if (parse.MaNguoiDung) {
      req.MaNguoiDung = parse.MaNguoiDung;
      req.bypass = parse.bypass || null;
      if (parse.bypass) {
        if (parse.bypass == fn.hmacMD5(parse.MaNguoiDung)) {
          next();
          return true;
        } else {
          res.status(403);
          returnApi.message = "You do not have permission to access!";
        }
      } else {
        next();
        return true;
      }
    } else {
      res.status(403);
      returnApi.message = "You do not have permission to access!";
    }
  } else {
    res.status(401);
    returnApi.message = "Token not present.";
  }
  res.send(returnApi.toObject());
  return false;
};

fn.Offset = function (page = 1, limit = process.env.DATA_PER_PAGE) {
  if (limit == 0) return "";
  if (page < 1 || !is_numeric(page)) page = 1;
  $offset = " LIMIT " + (page - 1) * limit + "," + limit;
  return $offset;
};

fn.uploadImg = async function (file, deleteSrc = false, deleteHash = null) {
  // upload multiple images via fs.createReadStream (node)
  const response = await imgurClient.upload({
    image: fs.createReadStream(file),
    type: "stream",
    album: process.env.IMGUR_ALBUM_ID,
  });
  // console.log(response.data);
  if (deleteSrc) fs.unlinkSync(file);
  if (deleteHash)
    imgurClient.deleteImage(
      deleteHash.replace("https://i.imgur.com/", "").split(".")[0]
    );
  return response.data;
};

fn.deleteImg = async function (deleteHash) {
  const response = await imgurClient.deleteImage(
    deleteHash.replace("https://i.imgur.com/", "").split(".")[0]
  );
  return response.data;
};

fn.makeid = function (length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

fn.sortObject = (obj) => {
  var sorted = {};
  var str = [];
  var key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
};

fn.padTo2Digits = (num) => {
  return num.toString().padStart(2, "0");
};

fn.payment = (returnUrl, order) => {
  var tmnCode = process.env.VNPAY_TMP_CODE;
  var secretKey = process.env.VNPAY_HASH_SECRET;
  var vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

  var date = new Date();
  var createDate =
    date.getFullYear().toString() +
    fn.padTo2Digits(date.getMonth() + 1) +
    fn.padTo2Digits(date.getDate()) +
    fn.padTo2Digits(date.getHours()) +
    fn.padTo2Digits(date.getMinutes()) +
    fn.padTo2Digits(date.getSeconds());

  var locale = order.language;
  if (!locale) locale = "vn";
  var currCode = "VND";
  var vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  // vnp_Params['vnp_Merchant'] = ''
  vnp_Params["vnp_Locale"] = locale;
  vnp_Params["vnp_CurrCode"] = currCode;
  vnp_Params["vnp_TxnRef"] = order.MaHoaDon + "." + fn.makeid(10);
  vnp_Params["vnp_OrderInfo"] = order.NoiDung;
  vnp_Params["vnp_OrderType"] = "250000";
  vnp_Params["vnp_Amount"] = order.SoTien * 100;
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] = order.ip;
  vnp_Params["vnp_CreateDate"] = createDate;

  vnp_Params = fn.sortObject(vnp_Params);

  var signData = querystring.stringify(vnp_Params, { encode: false });
  var hmac = crypto.createHmac("sha512", secretKey);
  var signed = hmac.update(new Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;
  vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

  return vnpUrl;
};

fn.verifyTransaction = (vnp_Params) => {
  let returnApi = new ReturnApi();
  var secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = fn.sortObject(vnp_Params);
  var signData = querystring.stringify(vnp_Params, { encode: false });
  var hmac = crypto.createHmac("sha512", process.env.VNPAY_HASH_SECRET);
  var signed = hmac.update(new Buffer.from(signData, "utf-8")).digest("hex");

  if (secureHash === signed) {
    var orderId = vnp_Params["vnp_TxnRef"];
    var vnpTranId = vnp_Params["vnp_TransactionNo"];
    var rspCode = vnp_Params["vnp_ResponseCode"];
    //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
    returnApi.success = true;
    returnApi.data = { orderId, vnpTranId, rspCode };
  } else returnApi.message = "Fail checksum";
  return returnApi.toObject();
};

module.exports = fn;

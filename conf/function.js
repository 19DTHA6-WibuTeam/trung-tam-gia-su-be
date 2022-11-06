const bcrypt = require("bcrypt");
const crypto = require("crypto");
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

module.exports = fn;

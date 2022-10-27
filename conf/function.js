const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const ReturnApi = require("../src/models/returnApi.model");

let fn = {};

fn.isNumeric = function (str) {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
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
      next();
      return true;
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

module.exports = fn;

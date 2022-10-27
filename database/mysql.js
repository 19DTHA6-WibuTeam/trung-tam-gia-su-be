const mysql = require("mysql");

let mysqlConn = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
  charset: "utf8mb4",
  dateStrings: "DATETIME",
});
// mysqlConn.connect(function (err) {
//   if (err) console.log("Mysql: " + err);
//   else console.log("Database Mysql Connected...");
// });
let i = 0;
console.log("mysqlConn called:", ++i);

module.exports = mysqlConn;

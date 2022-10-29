const mysql = require("mysql");

let pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
  charset: "utf8mb4",
  dateStrings: "DATETIME",
});
// pool.connect(function (err) {
//   if (err) console.log("Mysql: " + err);
//   else console.log("Database Mysql Connected...");
// });

pool.getConnection((err) => {
  if (err) console.log(err);
});

const connection = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) reject(err);
      console.log("MySQL pool connected: threadId " + connection.threadId);
      const query = (sql, binding) => {
        return new Promise((resolve, reject) => {
          connection.query(sql, binding, (err, result) => {
            if (err) reject(err);
            resolve(result);
          });
        });
      };
      const beginTransaction = () => {
        return new Promise((resolve, reject) => {
          if (err) reject(err);
          console.log("MySQL pool began: threadId " + connection.threadId);
          resolve(connection.beginTransaction());
        });
      };
      const commit = () => {
        return new Promise((resolve, reject) => {
          if (err) reject(err);
          console.log("MySQL pool committed: threadId " + connection.threadId);
          resolve(connection.commit());
        });
      };
      const rollback = () => {
        return new Promise((resolve, reject) => {
          if (err) reject(err);
          console.log("MySQL pool rollbacked: threadId " + connection.threadId);
          resolve(connection.rollback());
        });
      };
      const release = () => {
        return new Promise((resolve, reject) => {
          if (err) reject(err);
          console.log("MySQL pool released: threadId " + connection.threadId);
          resolve(connection.release());
        });
      };
      resolve({ query, beginTransaction, commit, rollback, release });
    });
  });
};

const query = (sql, binding) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, binding, (err, result, fields) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

module.exports = { pool, connection, query };

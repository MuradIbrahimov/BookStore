import mysql from "mysql2";

const pool = mysql.createPool(
  process.env.JAWSDB_URL ?? {
    host: "localhost",
    user: "root",
    database: "bookstoredb",
    password: "root",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  }
);

// async / await 사용
const promisePool = pool.promise();

// selec query
export const selectSql = {
  getUsers: async () => {
    try {
      const [rows] = await promisePool.query("SELECT * FROM admin");
      return rows;
    } catch (err) {
      console.error("Error fetching users:", err);
      throw err;
    }
  },
};

export const createSql = {};

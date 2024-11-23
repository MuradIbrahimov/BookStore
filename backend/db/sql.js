import mysql from "mysql2";

// Create a connection pool
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

// Convert pool to promise pool for async/await support
const promisePool = pool.promise();

// Define SQL queries
const selectSql = {
  getAdmins: async () => {
    try {
      const [results] = await promisePool.query("SELECT * FROM admin");
      return results;
    } catch (err) {
      throw new Error(`Error fetching admins: ${err.message}`);
    }
  },

  getCustomers: async () => {
    try {
      const [results] = await promisePool.query("SELECT * FROM customer");
      return results;
    } catch (err) {
      throw new Error(`Error fetching customers: ${err.message}`);
    }
  },
};

export { selectSql, promisePool };

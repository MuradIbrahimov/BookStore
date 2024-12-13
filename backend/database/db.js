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

  getAdminByEmail: async (email) => {
    try {
      const [results] = await promisePool.query(
        "SELECT * FROM admin WHERE email = ?",
        [email]
      );
      return results[0];
    } catch (err) {
      throw new Error(`Error fetching admin by email: ${err.message}`);
    }
  },

  getCustomerByEmail: async (email) => {
    try {
      const [results] = await promisePool.query(
        "SELECT * FROM customer WHERE email = ?",
        [email]
      );
      return results[0];
    } catch (err) {
      throw new Error(`Error fetching customer by email: ${err.message}`);
    }
  },
};

const insertSql = {
  saveSession: async ({ userId, token }) => {
    try {
      const query = "INSERT INTO sessions (user_id, token) VALUES (?, ?)";
      await promisePool.query(query, [userId, token]);
    } catch (err) {
      throw new Error(`Error saving session: ${err.message}`);
    }
  },
  saveSessionAdmin: async ({ userId, token }) => {
    try {
      const query = "INSERT INTO sessions (admin_id, token) VALUES (?, ?)";
      await promisePool.query(query, [userId, token]);
    } catch (err) {
      throw new Error(`Error saving session: ${err.message}`);
    }
  },
  deleteSessionByToken: async (token) => {
    try {
      const query = "DELETE FROM sessions WHERE token = ?";
      const [result] = await promisePool.query(query, [token]);
      return result; // Return the result to check affectedRows
    } catch (err) {
      throw new Error(`Error deleting session: ${err.message}`);
    }
  },
};

export { promisePool, selectSql, insertSql };

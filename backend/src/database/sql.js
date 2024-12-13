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
      const [rows] = await promisePool.query("SELECT * FROM customer");
      return rows;
    } catch (err) {
      console.error("Error fetching users:", err);
      throw err;
    }
  },
  getAdmins: async () => {
    try {
      const [rows] = await promisePool.query("SELECT * FROM admin");
      return rows;
    } catch (err) {
      console.error("Error fetching users:", err);
      throw err;
    }
  },
  getBooks: async () => {
    const [rows] = await promisePool.query("SELECT * FROM book");
    return rows;
  },
};

export const insertSql = {
  addBook: async (book) => {
    const { title, author_id, published_year, genre } = book;
    await promisePool.query(
      "INSERT INTO book (title, author_id, published_year, genre) VALUES (?, ?, ?, ?)",
      [title, author_id, published_year, genre]
    );
  },
};

export const updateSql = {
  editBook: async (book) => {
    const { id, title, author_id, published_year, genre } = book;
    await promisePool.query(
      "UPDATE book SET title = ?, author_id = ?, published_year = ?, genre = ? WHERE id = ?",
      [title, author_id, published_year, genre, id]
    );
  },
};
export const deleteSql = {
  deleteBook: async (id) => {
    await promisePool.query("DELETE FROM book WHERE id = ?", [id]);
  },
};

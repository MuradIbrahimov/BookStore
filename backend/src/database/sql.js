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
  getBooksWithAuthors: async () => {
    const [rows] = await promisePool.query(`
      SELECT 
        b.isbn,
        b.title,
        b.year,
        b.category,
        GROUP_CONCAT(a.name SEPARATOR ', ') AS author_name
      FROM 
        Book b
      LEFT JOIN Author_Book ab ON b.isbn = ab.book_isbn
      LEFT JOIN Author a ON ab.author_name = a.name
      GROUP BY b.isbn;
    `);
    return rows;
  },
  getBookByIsbn: async (isbn) => {
    const [rows] = await promisePool.query(
      "SELECT * FROM book WHERE isbn = ?",
      [isbn]
    );
    return rows.length ? rows[0] : null;
  },

  // Get author by name
  getAuthorByName: async (name) => {
    const [rows] = await promisePool.query(
      "SELECT * FROM author WHERE name = ?",
      [name]
    );
    return rows.length ? rows[0] : null;
  },
  getAuthorBookRelationships: async () => {
    const [rows] = await promisePool.query(`
      SELECT ab.author_name, a.name AS author_name, ab.book_isbn, b.title AS book_title
      FROM Author_Book ab
      JOIN Author a ON ab.author_name = a.name
      JOIN Book b ON ab.book_isbn = b.isbn
    `);
    return rows;
  },
};

export const insertSql = {
  addBook: async ({ isbn, title, year, category, price }) => {
    await promisePool.query(
      "INSERT INTO Book (isbn, title, year, category, price) VALUES (?, ?, ?, ?, ?)",
      [isbn, title, year, category, price]
    );
  },
  // Add a new author
  addAuthor: async ({ name }) => {
    await promisePool.query("INSERT INTO Author (name) VALUES (?)", [name]);
  },

  // Add a relationship between an author and a book
  addAuthorBookRelationship: async ({ author_name, book_isbn }) => {
    await promisePool.query(
      "INSERT INTO Author_Book (author_name, book_isbn) VALUES (?, ?)",
      [author_name, book_isbn]
    );
  },
};

export const updateSql = {
  updateBook: async ({ isbn, title, year, category, price }) => {
    await promisePool.query(
      "UPDATE Book SET title = ?, year = ?, category = ?, price = ? WHERE isbn = ?",
      [title, year, category, price, isbn]
    );
  },
};
export const deleteSql = {
  // Delete relationships from Author_Book by book ISBN
  deleteAuthorBookRelationships: async (book_isbn) => {
    await promisePool.query("DELETE FROM Author_Book WHERE book_isbn = ?", [
      book_isbn,
    ]);
  },

  // Delete a book by ISBN
  deleteBook: async (isbn) => {
    await promisePool.query("DELETE FROM Book WHERE isbn = ?", [isbn]);
  },
};

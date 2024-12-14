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
        b.price,
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
  getAuthorsWithBooks: async () => {
    const query = `
      SELECT
        a.name AS author_name,
        a.address,
        a.url,
        b.isbn AS book_isbn,
        b.title AS book_title
      FROM author a
      LEFT JOIN author_book ab ON a.name = ab.author_name
      LEFT JOIN book b ON ab.book_isbn = b.isbn
    `;

    const [rows] = await promisePool.query(query);

    // Group books by authors
    const authors = [];
    const authorMap = new Map();

    rows.forEach((row) => {
      if (!authorMap.has(row.author_name)) {
        const author = {
          name: row.author_name,
          address: row.address,
          url: row.url,
          books: [],
        };
        authorMap.set(row.author_name, author);
        authors.push(author);
      }

      if (row.book_isbn) {
        authorMap.get(row.author_name).books.push({
          isbn: row.book_isbn,
          title: row.book_title,
        });
      }
    });

    return authors;
  },

  //AWARDS
  getAwardsWithAssociations: async () => {
    const query = `
      SELECT DISTINCT
  a.name AS award_name,
  a.year,
  aa.author_name,
  b.title AS book_title,
  ab.book_isbn
FROM Award a
LEFT JOIN Award_Author aa ON a.name = aa.award_name
LEFT JOIN Award_Book ab ON a.name = ab.award_name
LEFT JOIN Book b ON ab.book_isbn = b.isbn;

    `;
    const [rows] = await promisePool.query(query);
    return rows;
  },

  // Get award by name
  getAwardByName: async (name) => {
    const query = `SELECT * FROM Award WHERE name = ?`;
    const [rows] = await promisePool.query(query, [name]);
    return rows[0];
  },
  getWarehousesWithInventory: async () => {
    const query = `
    SELECT 
      w.code, w.address, w.phone, 
      b.title AS book_title, b.isbn AS book_isbn, i.number
    FROM Warehouses w
    LEFT JOIN Inventory i ON w.code = i.warehouse_code
    LEFT JOIN Book b ON i.book_isbn = b.isbn;
  `;
    const [rows] = await promisePool.query(query);
    return rows.reduce((result, row) => {
      if (!result[row.code]) {
        result[row.code] = {
          code: row.code,
          address: row.address,
          phone: row.phone,
          inventory: [],
        };
      }
      if (row.book_isbn) {
        result[row.code].inventory.push({
          book_title: row.book_title,
          book_isbn: row.book_isbn,
          number: row.number,
        });
      }
      return result;
    }, {});
  },
  getShoppingBasketsWithContents: async () => {
    const query = `
      SELECT sb.id, sb.order_date, sb.customer_email, 
             b.title AS book_title, b.isbn AS book_isbn, c.quantity
      FROM Shopping_Baskets sb
      LEFT JOIN Contains c ON sb.id = c.shopping_basket_id
      LEFT JOIN Book b ON c.book_isbn = b.isbn
      ORDER BY sb.id;
    `;
    const [rows] = await promisePool.query(query);
    return rows;
  },
  getShoppingBasketsWithContents: async () => {
  const query = `
    SELECT 
      sb.id AS basket_id,
      sb.order_date,
      sb.customer_email,
      c.book_isbn,
      b.title AS book_title,
      c.quantity
    FROM Shopping_Baskets sb
    LEFT JOIN Contains c ON sb.id = c.shopping_basket_id
    LEFT JOIN Book b ON c.book_isbn = b.isbn;
  `;
  const [rows] = await promisePool.query(query);

  // Group rows by basket_id to organize contents under each basket
  const groupedBaskets = rows.reduce((acc, row) => {
    const basket = acc[row.basket_id] || {
      id: row.basket_id,
      order_date: row.order_date,
      customer_email: row.customer_email,
      contents: [],
    };

    if (row.book_isbn) {
      basket.contents.push({
        book_isbn: row.book_isbn,
        book_title: row.book_title,
        quantity: row.quantity,
      });
    }

    acc[row.basket_id] = basket;
    return acc;
  }, {});

  return Object.values(groupedBaskets);
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
  addAuthor: async ({ name, address = null, url = null }) => {
    const query = "INSERT INTO author (name, address, url) VALUES (?, ?, ?)";
    await promisePool.query(query, [name, address, url]);
  },

  // Add a relationship between an author and a book
  addAuthorBookRelationship: async ({ author_name, book_isbn }) => {
    await promisePool.query(
      "INSERT INTO Author_Book (author_name, book_isbn) VALUES (?, ?)",
      [author_name, book_isbn]
    );
  },
  // Add a new award
  addAward: async ({ name, year }) => {
    const query = `INSERT INTO Award (name, year) VALUES (?, ?)`;
    await promisePool.query(query, [name, year]);
  },

  // Add an award-author relationship
  addAwardAuthorRelationship: async ({ award_name, author_name }) => {
    const query = `INSERT INTO Award_Author (award_name, author_name) VALUES (?, ?)`;
    await promisePool.query(query, [award_name, author_name]);
  },

  // Add an award-book relationship
  addAwardBookRelationship: async ({ award_name, book_isbn }) => {
    const query = `INSERT INTO Award_Book (award_name, book_isbn) VALUES (?, ?)`;
    await promisePool.query(query, [award_name, book_isbn]);
  },
  addWarehouse: async ({ code, address, phone }) => {
    const query = `
    INSERT INTO Warehouses (code, address, phone)
    VALUES (?, ?, ?);
  `;
    try {
      await promisePool.query(query, [code, address, phone]);
    } catch (error) {
      throw new Error(`Error inserting warehouse: ${error.message}`);
    }
  },
  addInventory: async ({ warehouse_code, book_isbn, number }) => {
    const query = `
    INSERT INTO Inventory (warehouse_code, book_isbn, number)
    VALUES (?, ?, ?);
  `;
    try {
      await promisePool.query(query, [warehouse_code, book_isbn, number]);
    } catch (error) {
      throw new Error(`Error inserting inventory: ${error.message}`);
    }
  },
  addShoppingBasket: async ({ order_date, customer_email }) => {
    const query = "INSERT INTO Shopping_Baskets (order_date, customer_email) VALUES (?, ?)";
    await promisePool.query(query, [order_date, customer_email]);
  },
  addBookToBasket: async ({ shopping_basket_id, book_isbn, quantity }) => {
    const query = "INSERT INTO Contains (shopping_basket_id, book_isbn, quantity) VALUES (?, ?, ?)";
    await promisePool.query(query, [shopping_basket_id, book_isbn, quantity]);
  },

};

export const updateSql = {
  updateBook: async ({ isbn, title, year, category, price }) => {
    await promisePool.query(
      "UPDATE Book SET title = ?, year = ?, category = ?, price = ? WHERE isbn = ?",
      [title, year, category, price, isbn]
    );
  },
  updateAuthor: async ({ name, address, url }) => {
    const query = "UPDATE author SET address = ?, url = ? WHERE name = ?";
    await promisePool.query(query, [address, url, name]);
  },
  // Update award details
  updateAward: async ({ name, year }) => {
    const query = `UPDATE Award SET year = ? WHERE name = ?`;
    await promisePool.query(query, [year, name]);
  },
  updateWarehouse: async ({ code, address, phone }) => {
    const query = `
    UPDATE Warehouses
    SET address = ?, phone = ?
    WHERE code = ?;
  `;
    try {
      await promisePool.query(query, [address, phone, code]);
    } catch (error) {
      throw new Error(`Error updating warehouse: ${error.message}`);
    }
  },
  updateInventory: async ({ warehouse_code, book_isbn, number }) => {
    const query = `
    UPDATE Inventory
    SET number = ?
    WHERE warehouse_code = ? AND book_isbn = ?;
  `;
    try {
      await promisePool.query(query, [number, warehouse_code, book_isbn]);
    } catch (error) {
      throw new Error(`Error updating inventory: ${error.message}`);
    }
  },
  updateInventoryQuantity: async ({ warehouse_code, book_isbn, number }) => {
    const query = `
      UPDATE Inventory
      SET number = ?
      WHERE warehouse_code = ? AND book_isbn = ?;
    `;
    await promisePool.query(query, [number, warehouse_code, book_isbn]);
  },
  updateShoppingBasket: async ({ id, order_date, customer_email }) => {
    const query =
      "UPDATE Shopping_Baskets SET order_date = ?, customer_email = ? WHERE id = ?";
    await promisePool.query(query, [order_date, customer_email, id]);
  },
  updateBasketQuantity: async ({ shopping_basket_id, book_isbn, quantity }) => {
    const query =
      "UPDATE Contains SET quantity = ? WHERE shopping_basket_id = ? AND book_isbn = ?";
    await promisePool.query(query, [quantity, shopping_basket_id, book_isbn]);
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
  deleteAuthor: async (name) => {
    const query = "DELETE FROM author WHERE name = ?";
    await promisePool.query(query, [name]);
  },
  // Delete relationships for a specific author
  deleteAuthorBookRelationshipsByAuthor: async (author_name) => {
    const query = "DELETE FROM author_book WHERE author_name = ?";
    await promisePool.query(query, [author_name]);
  },
  // Delete an award
  deleteAward: async (name) => {
    const query = `DELETE FROM Award WHERE name = ?`;
    await promisePool.query(query, [name]);
  },

  // Delete all award-author relationships for a specific award
  deleteAwardAuthorRelationship: async (award_name) => {
    const query = `DELETE FROM Award_Author WHERE award_name = ?`;
    await promisePool.query(query, [award_name]);
  },

  // Delete all award-book relationships for a specific award
  deleteAwardBookRelationship: async (award_name) => {
    const query = `DELETE FROM Award_Book WHERE award_name = ?`;
    await promisePool.query(query, [award_name]);
  },
  deleteWarehouse: async (code) => {
    const query = `
    DELETE FROM Warehouses
    WHERE code = ?;
  `;
    try {
      await promisePool.query(query, [code]);
    } catch (error) {
      throw new Error(`Error deleting warehouse: ${error.message}`);
    }
  },
  deleteInventoryByWarehouse: async (warehouse_code) => {
    const query = `
    DELETE FROM Inventory
    WHERE warehouse_code = ?;
  `;
    try {
      await promisePool.query(query, [warehouse_code]);
    } catch (error) {
      throw new Error(
        `Error deleting inventory by warehouse: ${error.message}`
      );
    }
  },
  deleteBasket: async (id) => {
    const query = "DELETE FROM Shopping_Baskets WHERE id = ?";
    await promisePool.query(query, [id]);
  },
};

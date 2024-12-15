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
  getCustomerByEmail: async (email) => {
    const query = `
    SELECT email, password 
    FROM Customer 
    WHERE email = ?;
  `;
    const [rows] = await promisePool.query(query, [email]);
    return rows[0]; // Return the first result
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
  getBasketById: async (id) => {
  const query = `
    SELECT id, locked_by, locked_at
    FROM Shopping_Baskets
    WHERE id = ?;
  `;
  const [rows] = await promisePool.query(query, [id]);
  return rows[0];
},
  getShoppingBasketsWithContents: async () => {
  const query = `
    SELECT 
      sb.id AS basket_id,
      sb.order_date,
      sb.customer_email,
      sb.locked_by,
      c.book_isbn,
      b.title AS book_title,
      c.quantity
    FROM Shopping_Baskets sb
    LEFT JOIN Contains c ON sb.id = c.shopping_basket_id
    LEFT JOIN Book b ON c.book_isbn = b.isbn;
  `;

  const [rows] = await promisePool.query(query);

  // Group rows by basket ID
  const baskets = rows.reduce((acc, row) => {
    // Find or create the basket
    let basket = acc.find(b => b.basket_id === row.basket_id);
    if (!basket) {
      basket = {
        basket_id: row.basket_id,
        order_date: row.order_date,
        customer_email: row.customer_email,
        locked_by: row.locked_by,
        contents: []
      };
      acc.push(basket);
    }

    // Add contents if the row includes a book
    if (row.book_isbn) {
      basket.contents.push({
        book_title: row.book_title,
        book_isbn: row.book_isbn,
        quantity: row.quantity,
        locked_by: row.locked_by
      });
    }

    return acc;
  }, []);

  return baskets;
},
  getShoppingBasketById: async (id) => {
  const query = `
    SELECT *
    FROM Shopping_Baskets
    WHERE id = ?;
  `;

  const [rows] = await promisePool.query(query, [id]);
  return rows[0]; // Return the first result
  },
  getShoppingBasketByIdContents: async (id) => {
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
    LEFT JOIN Book b ON c.book_isbn = b.isbn
    WHERE sb.id = ?;
  `;

  const [rows] = await promisePool.query(query, [id]);

  if (rows.length === 0) {
    return null; // Return null if the basket doesn't exist
  }

  // Construct the basket object with contents
  const basket = {
    id: rows[0].basket_id,
    order_date: rows[0].order_date,
    customer_email: rows[0].customer_email,
    contents: rows
      .filter(row => row.book_isbn) // Exclude rows without books
      .map(row => ({
        book_title: row.book_title,
        book_isbn: row.book_isbn,
        quantity: row.quantity
      }))
  };

  return basket;
},
  getAllBooks: async () => {
    const query = `
   SELECT 
  b.isbn,
  b.title,
  b.category,
  b.price,
  COALESCE(GROUP_CONCAT(DISTINCT a.name SEPARATOR ', '), 'No Authors') AS authors,
  COALESCE(GROUP_CONCAT(DISTINCT aw.name SEPARATOR ', '), 'No Awards') AS awards,
  COALESCE((SELECT SUM(i.number) 
            FROM Inventory i 
            WHERE i.book_isbn = b.isbn), 0) AS total_quantity
FROM 
  Book b
LEFT JOIN 
  Author_Book ab ON b.isbn = ab.book_isbn
LEFT JOIN 
  Author a ON ab.author_name = a.name
LEFT JOIN 
  Award_Book awb ON b.isbn = awb.book_isbn
LEFT JOIN 
  Award aw ON awb.award_name = aw.name
GROUP BY 
  b.isbn, b.title, b.category, b.price;

  `;
    const [rows] = await promisePool.query(query);
    return rows;
  },
  searchBooks: async (query) => {
  const sql = `
    SELECT 
      b.isbn,
      b.title,
      b.category,
      b.price,
      COALESCE(GROUP_CONCAT(DISTINCT a.name SEPARATOR ', '), 'No Authors') AS authors,
      COALESCE(GROUP_CONCAT(DISTINCT aw.name SEPARATOR ', '), 'No Awards') AS awards,
      COALESCE((SELECT SUM(i.number) 
                FROM Inventory i 
                WHERE i.book_isbn = b.isbn), 0) AS total_quantity
    FROM 
      Book b
    LEFT JOIN 
      Author_Book ab ON b.isbn = ab.book_isbn
    LEFT JOIN 
      Author a ON ab.author_name = a.name
    LEFT JOIN 
      Award_Book awb ON b.isbn = awb.book_isbn
    LEFT JOIN 
      Award aw ON awb.award_name = aw.name
    WHERE 
      b.title LIKE ? OR 
      a.name LIKE ? OR 
      aw.name LIKE ?
    GROUP BY 
      b.isbn, b.title, b.category, b.price;
  `;
  const searchQuery = `%${query}%`;
  const [rows] = await promisePool.query(sql, [
    searchQuery,
    searchQuery,
    searchQuery,
  ]);
  return rows;
},
  getTotalBookQuantity: async (isbn) => {
    const sql = `
      SELECT SUM(number) AS total_quantity
      FROM Inventory
      WHERE book_isbn = ?;
    `;
    const [rows] = await promisePool.query(sql, [isbn]);
    return rows[0]?.total_quantity || 0;
  },
  getCustomerBasket: async (email) => {
    const query = `
    SELECT b.title, c.quantity, b.price, b.isbn
    FROM Shopping_Baskets sb
    JOIN Contains c ON sb.id = c.shopping_basket_id
    JOIN Book b ON c.book_isbn = b.isbn
    WHERE sb.customer_email = ?;
  `;
    const [rows] = await promisePool.query(query, [email]);
    return rows;
  },
  getCustomerReservations: async (email) => {
  const query = `
    SELECT r.id, r.reservation_date, r.pickup_time, b.title AS book_title, b.isbn
    FROM Reservation r
    JOIN Book b ON r.book_isbn = b.isbn
    WHERE r.customer_email = ?;
  `;
  const [rows] = await promisePool.query(query, [email]);
  return rows;
  },
 checkConflictingReservations: async ({ reservation_id, book_isbn, pickup_time }) => {
  const query = `
    SELECT id
    FROM Reservation
    WHERE book_isbn = ? 
      AND ABS(TIMESTAMPDIFF(MINUTE, pickup_time, ?)) < 10
      AND id != ?;
  `;
  const [rows] = await promisePool.query(query, [book_isbn, pickup_time, reservation_id]);
  return rows;
},
  getReservationById: async (reservation_id) => {
  const query = `
    SELECT book_isbn
    FROM Reservation
    WHERE id = ?;
  `;
  const [rows] = await promisePool.query(query, [reservation_id]);
  return rows[0]; // Return the first row (or undefined if no match)
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
    const query =
      "INSERT INTO Shopping_Baskets (order_date, customer_email) VALUES (?, ?)";
    await promisePool.query(query, [order_date, customer_email]);
  },

  addBookToBasket: async ({ customer_email, book_isbn, quantity }) => {
    const query = `
    INSERT INTO Contains (shopping_basket_id, book_isbn, quantity)
    VALUES (
      (SELECT id FROM Shopping_Baskets WHERE customer_email = ? ORDER BY order_date DESC LIMIT 1),
      ?, ?
    )
    ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity);
  `;
    await promisePool.query(query, [customer_email, book_isbn, quantity]);
  },
  purchaseBasket: async (email) => {
    const query = `
    DELETE FROM Contains 
    WHERE shopping_basket_id = (
      SELECT id 
      FROM Shopping_Baskets 
      WHERE customer_email = ? 
      ORDER BY order_date DESC LIMIT 1
    );
  `;
    const [result] = await promisePool.query(query, [email]);
    return result.affectedRows > 0;
  },
 addReservation: async ({ customer_email, book_isbn, reservation_date, pickup_time }) => {
  const query = `
    INSERT INTO Reservation (customer_email, book_isbn, reservation_date, pickup_time)
    VALUES (?, ?, ?, ?);
  `;
  const [result] = await promisePool.query(query, [
    customer_email,
    book_isbn,
    reservation_date,
    pickup_time,
  ]);
  return result.insertId;
},
  checkConflictingReservations: async ({ book_isbn, pickup_time }) => {
  const query = `
    SELECT *
    FROM Reservation
    WHERE book_isbn = ?
      AND ABS(TIMESTAMPDIFF(MINUTE, pickup_time, ?)) < 10;
  `;
  const [rows] = await promisePool.query(query, [book_isbn, pickup_time]);
  return rows;
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
    const query = `
    UPDATE Shopping_Baskets
    SET order_date = ?, customer_email = ?
    WHERE id = ?;
  `;
    const [result] = await promisePool.query(query, [
      order_date,
      customer_email,
      id,
    ]);
    return result.affectedRows > 0;
  },
  unlockAllBaskets: async () => {
    const query = `
    UPDATE Shopping_Baskets
    SET locked_by = NULL, locked_at = NULL;
  `;
    try {
      const [result] = await promisePool.query(query);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },
  updateBasketQuantity: async ({ customer_email, book_isbn, quantity }) => {
    // Log inputs for debugging
    console.log("Updating basket:", { customer_email, book_isbn, quantity });

    const query = `
    UPDATE Contains
    SET quantity = ?
    WHERE shopping_basket_id IN (
      SELECT id 
      FROM Shopping_Baskets 
      WHERE customer_email = ?
    ) AND book_isbn = ?;
  `;

    try {
      const [result] = await promisePool.query(query, [
        quantity,
        customer_email,
        book_isbn,
      ]);
      console.log("Update result:", result);

      if (result.affectedRows > 0) {
        return true; // Rows were updated
      } else {
        console.warn("Failed to update basket. No rows affected.");
        return false; // No rows matched
      }
    } catch (error) {
      console.error("Error updating basket:", error);
      throw error; // Re-throw the error to handle it upstream
    }
  },
  decreaseInventory: async ({ book_isbn, quantity }) => {
    const query = `
    UPDATE Inventory
    SET number = number - ?
    WHERE book_isbn = ? AND number >= ?;
  `;
    const [result] = await promisePool.query(query, [
      quantity,
      book_isbn,
      quantity,
    ]);
    return result.affectedRows > 0;
  },
  updateReservation: async ({
    reservation_id,
    reservation_date,
    pickup_time,
  }) => {
    const query = `
    UPDATE Reservation
    SET reservation_date = ?, pickup_time = ?
    WHERE id = ?;
  `;
    const [result] = await promisePool.query(query, [
      reservation_date,
      pickup_time,
      reservation_id,
    ]);
    return result.affectedRows > 0;
  },

  updateReservationPickupTime: async ({ reservation_id, pickup_time }) => {
    const query = `
    UPDATE Reservation
    SET pickup_time = ?
    WHERE id = ?;
  `;
    const [result] = await promisePool.query(query, [
      pickup_time,
      reservation_id,
    ]);
    return result.affectedRows > 0;
  },
  decreaseInventoryByOne: async (book_isbn) => {
    const query = `
    UPDATE Inventory
    SET number = number - 1
    WHERE book_isbn = ? AND number > 0;
  `;
    const [result] = await promisePool.query(query, [book_isbn]);
    return result.affectedRows > 0; // Return true if rows were updated
  },
  increaseInventoryByOne: async (book_isbn) => {
    const query = `
    UPDATE Inventory
    SET number = number + 1
    WHERE book_isbn = ?;
  `;
    const [result] = await promisePool.query(query, [book_isbn]);
    return result.affectedRows > 0; // Return true if rows were updated
  },
 lockBasket: async (id, lockedBy) => {
  const query = `
    UPDATE Shopping_Baskets
    SET locked_by = ?, locked_at = NOW()
    WHERE id = ?
      AND (locked_by IS NULL OR locked_by = '' OR TIMESTAMPDIFF(MINUTE, locked_at, NOW()) > 5);
  `;
  console.log(`Executing lock query for basket ID ${id} with user: ${lockedBy}`);
  const [result] = await promisePool.query(query, [lockedBy, id]);
  console.log(`Lock query result for basket ID ${id}:`, result);
  return result.affectedRows > 0;
},
  unlockBasket: async (id) => {
    const query = `
    UPDATE Shopping_Baskets
    SET locked_by = NULL, locked_at = NULL
    WHERE id = ?;
  `;
    const [result] = await promisePool.query(query, [id]);
    return result.affectedRows > 0;
  },
  startTransaction: async () => {
    const query = `START TRANSACTION;`;
    await promisePool.query(query);
  },
  commitTransaction: async () => {
    const query = `COMMIT;`;
    await promisePool.query(query);
  },

  rollbackTransaction: async () => {
    const query = `ROLLBACK;`;
    await promisePool.query(query);
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
  deleteBookFromBasket: async ({ customer_email, book_isbn }) => {
  const query = `
    DELETE FROM Contains
    WHERE shopping_basket_id = (
      SELECT id 
      FROM Shopping_Baskets 
      WHERE customer_email = ? ORDER BY order_date DESC LIMIT 1
    ) AND book_isbn = ?;
  `;
  await promisePool.query(query, [customer_email, book_isbn]);
  },
  clearBasket: async (customer_email) => {
  const query = `
    DELETE c
    FROM Contains c
    JOIN Shopping_Baskets sb ON c.shopping_basket_id = sb.id
    WHERE sb.customer_email = ?;
  `;
  const [result] = await promisePool.query(query, [customer_email]);
  return result.affectedRows > 0;
  },
  deleteReservation: async (reservation_id) => {
  const query = `
    DELETE FROM Reservation
    WHERE id = ?;
  `;
  const [result] = await promisePool.query(query, [reservation_id]);
  return result.affectedRows > 0;
  },
 

};

import express from "express";
import { selectSql, insertSql,updateSql,deleteSql } from "../database/sql";

const router = express.Router();

// Main customer page
router.get("/", async (req, res) => {
  if (!req.cookies.user || req.cookies.user.role !== "customer") {
    return res.redirect("/"); // Redirect to login if not logged in
  }

  try {
    res.render("customer", { user: req.cookies.user });
  } catch (error) {
    console.error("Error loading customer page:", error);
    res.status(500).send("Error loading customer page.");
  }
});

// Fetch all books
router.get("/books", async (req, res) => {
  if (!req.cookies.user || req.cookies.user.role !== "customer") {
    return res.redirect("/"); // Redirect to login if not logged in
  }

  try {
      const books = await selectSql.getAllBooks();
      console.log({ books });
      
    res.render("customerBooks", { books });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).send("Error fetching books.");
  }
});

// Search books by Name, Author, or Award
router.get("/books/search", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).send("Search query is required.");
  }

  try {
    const results = await selectSql.searchBooks(query);

    // Enrich results with total quantity from all warehouses
    const booksWithQuantities = await Promise.all(
      results.map(async (book) => {
        const totalQuantity = await selectSql.getTotalBookQuantity(book.isbn);
        return { ...book, totalQuantity };
      })
    );

    res.render("customerBooks", { books: booksWithQuantities });
  } catch (error) {
    console.error("Error searching books:", error);
    res.status(500).send("Error searching books.");
  }
});

// View shopping basket
router.get("/basket", async (req, res) => {
  if (!req.cookies.user || req.cookies.user.role !== "customer") {
    return res.redirect("/"); // Redirect to login if not logged in
  }

  const { email } = req.cookies.user;

  try {
    const basket = await selectSql.getCustomerBasket(email);
    res.render("customerBasket", { basket });
  } catch (error) {
    console.error("Error fetching basket:", error);
    res.status(500).send("Error fetching basket.");
  }
});

// Add book to basket
router.post("/basket/add", async (req, res) => {
  const { email } = req.cookies.user;
  const { book_isbn, quantity } = req.body;

  try {
    const totalQuantity = await selectSql.getTotalBookQuantity(book_isbn);

    if (totalQuantity <= 0) {
      return res.status(400).send("Book is out of stock.");
    }

    if (quantity > totalQuantity) {
      return res
        .status(400)
        .send("Requested quantity exceeds available stock.");
    }

    await insertSql.addBookToBasket({
      customer_email: email,
      book_isbn,
      quantity,
    });

    res.redirect("/customer/basket");
  } catch (error) {
    console.error("Error adding book to basket:", error);
    res.status(500).send("Error adding book to basket.");
  }
});
router.post("/basket/update", async (req, res) => {
  const { email } = req.cookies.user;
  const { book_isbn, quantity } = req.body;

  if (quantity <= 0) {
    return res.status(400).send("Quantity must be greater than 0.");
  }

  try {
    // Fetch the total available quantity of the book from the inventory
    const totalAvailable = await selectSql.getTotalBookQuantity(book_isbn);

    // Check if the requested quantity exceeds the available stock
    if (quantity > totalAvailable) {
      return res
        .status(400)
        .send(
          `Not enough stock available. Only ${totalAvailable} items are in stock.`
        );
    }

    // Proceed to update the basket
    const success = await updateSql.updateBasketQuantity({
      customer_email: email,
      book_isbn,
      quantity,
    });

    if (success) {
      res.redirect("/customer/basket");
    } else {
      res.status(400).send("Failed to update basket.");
    }
  } catch (error) {
    console.error("Error updating basket:", error);
    res.status(500).send("Error updating basket.");
  }
});

// Delete a book from the basket
router.post("/basket/delete", async (req, res) => {
  const { email } = req.cookies.user;
  const { book_isbn } = req.body;

  try {
    await deleteSql.deleteBookFromBasket({ customer_email: email, book_isbn });
    res.redirect("/customer/basket");
  } catch (error) {
    console.error("Error deleting book from basket:", error);
    res.status(500).send("Error deleting book from basket.");
  }
});
router.post("/basket/purchase", async (req, res) => {
  const { email } = req.cookies.user;

  try {
    // Step 1: Fetch the contents of the customer's basket
    const basketContents = await selectSql.getCustomerBasket(email);

    // Step 2: Check stock availability for each book in the basket
    for (const item of basketContents) {
      const totalAvailable = await selectSql.getTotalBookQuantity(item.isbn);

      if (item.quantity > totalAvailable) {
        return res
          .status(400)
          .send(
            `Purchase failed. Not enough stock for book "${item.title}". Available: ${totalAvailable}, Requested: ${item.quantity}.`
          );
      }
    }

    // Step 3: Deduct quantities from the inventory
    for (const item of basketContents) {
      await updateSql.decreaseInventory({
        book_isbn: item.isbn,
        quantity: item.quantity,
      });
    }

    // Step 4: Clear the customer's basket (optional, if required)
    await deleteSql.clearBasket(email);

    res.redirect("/customer/basket"); // Redirect back to the basket (now empty)
  } catch (error) {
    console.error("Error proceeding to purchase:", error);
    res.status(500).send("Error processing purchase.");
  }
});
// Reserve a book
router.post("/reserve", async (req, res) => {
  const { email } = req.cookies.user;
  const { book_isbn, reservation_date, pickup_time } = req.body;

  try {
    // Step 1: Check stock availability
    const totalQuantity = await selectSql.getTotalBookQuantity(book_isbn);
    if (totalQuantity <= 0) {
      return res.status(400).send("Reservation failed. The book is out of stock.");
    }

    // Step 2: Check for conflicting reservations
    const conflictingReservations = await selectSql.checkConflictingReservations({
      book_isbn,
      pickup_time,
    });

    if (conflictingReservations.length > 0) {
      return res.status(400).send(
        "Reservation failed. There is already a reservation within 10 minutes of the selected pickup time."
      );
    }

    // Step 3: Create the reservation
    await insertSql.addReservation({
      customer_email: email,
      book_isbn,
      reservation_date,
      pickup_time,
    });

    // Step 4: Decrease book quantity in inventory
    await updateSql.decreaseInventoryByOne(book_isbn);

    res.redirect("/customer/books");
  } catch (error) {
    console.error("Error making reservation:", error);
    res.status(500).send("Error making reservation.");
  }
});


// Fetch all reservations for the customer
router.get("/reservation", async (req, res) => {
  const { email } = req.cookies.user;

  try {
    const reservations = await selectSql.getCustomerReservations(email);
    res.render("customerReservations", { reservations });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).send("Error fetching reservations.");
  }
});

// Update reservation
router.post("/reservation/update", async (req, res) => {
  const { reservation_id, reservation_date, pickup_time } = req.body;

  try {
    const currentDateTime = new Date();

    // Combine reservation_date and pickup_time into a single datetime object
    const newReservationDateTime = new Date(`${reservation_date}T${pickup_time}`);

    if (newReservationDateTime < currentDateTime) {
      return res.status(400).send("Reservation cannot be updated to a past time.");
    }

    // Check for conflicting reservations
    const conflictingReservations = await selectSql.checkConflictingReservations({
      reservation_id, // Ensure current reservation is excluded
      book_isbn: req.body.book_isbn,
      pickup_time,
    });

    if (conflictingReservations.length > 0) {
      return res
        .status(400)
        .send(
          "Reservation update failed. Another reservation exists within 10 minutes of the selected time."
        );
    }

    // Update the reservation
    const updated = await updateSql.updateReservation({
      reservation_id,
      reservation_date,
      pickup_time,
    });

    if (!updated) {
      return res.status(400).send("Failed to update reservation.");
    }

    res.redirect("/customer/reservation");
  } catch (error) {
    console.error("Error updating reservation:", error);
    res.status(500).send("Error updating reservation.");
  }
});

// Cancel a reservation
router.post("/reservation/delete", async (req, res) => {
  const { reservation_id } = req.body;

  try {
    // Step 1: Get the book ISBN associated with the reservation
    const reservation = await selectSql.getReservationById(reservation_id);
    if (!reservation) {
      return res.status(404).send("Reservation not found.");
    }

    const { book_isbn } = reservation;

    // Step 2: Delete the reservation
    await deleteSql.deleteReservation(reservation_id);

    // Step 3: Increase the book quantity in inventory
    await updateSql.increaseInventoryByOne(book_isbn);

    res.redirect("/customer/reservation");
  } catch (error) {
    console.error("Error canceling reservation:", error);
    res.status(500).send("Error canceling reservation.");
  }
});


export default router;

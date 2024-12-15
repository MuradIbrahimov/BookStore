import express from "express";
import { selectSql, updateSql,pool } from "../database/sql";

const router = express.Router();

// Fetch all shopping baskets
router.get("/", async (req, res) => {

  try {
    const baskets = await selectSql.getShoppingBasketsWithContents();
    console.log(baskets[0].contents);
    res.render("adminShoppingBaskets", {
      baskets,
      currentUser: req.cookies.user,
    });
  } catch (error) {
    console.error("Error fetching shopping baskets:", error);
    res.status(500).send("Error fetching shopping baskets.");
  }
});

router.post("/lock/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const userCookie = JSON.parse(req.cookies.user); // Parse the user cookie
    console.log("Parsed User Cookie:", userCookie);

    const currentUser = userCookie.email; // Extract the email
    console.log(`Locking basket ID ${id} for user: ${currentUser}`);

    await updateSql.startTransaction();

    const success = await updateSql.lockBasket(id, currentUser);
    console.log(`Lock success for basket ID ${id}:`, success);

    if (!success) {
      await updateSql.rollbackTransaction();
      console.error("Failed to lock basket: It may already be locked.");
      return res
        .status(400)
        .send("Failed to lock basket. It may already be locked.");
    }

    await updateSql.commitTransaction();
    console.log(`Transaction committed: Basket ${id} locked by ${currentUser}`);
    res.redirect(`/admin/shoppingBaskets/edit/${id}`);
  } catch (error) {
    await updateSql.rollbackTransaction();
    console.error("Error locking basket:", error);
    res.status(500).send("Error locking basket.");
  }
});



router.get("/edit/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const basket = await selectSql.getShoppingBasketById(id);
    const basketrender = await selectSql.getShoppingBasketByIdContents(id);

    console.log(`Fetched basket for ID ${id}:`, basket);

    if (!req.cookies.user) {
      console.error("User cookie is missing.");
      return res.status(401).send("Unauthorized: User cookie is missing.");
    }

    const currentUser = JSON.parse(req.cookies.user); // Parse the user cookie
    console.log("Parsed User Cookie:", currentUser);
    console.log(
      `Basket locked by: ${basket ? basket.locked_by : "No basket found"}`
    );
    console.log(`Current user email: ${currentUser.email}`);

    if (!basket || basket.locked_by !== currentUser.email) {
      console.error("Edit denied: Basket locked by another user or not found.");
      return res
        .status(400)
        .send("You cannot edit this basket. It is locked by another user.");
    }

    console.log("User authorized to edit the basket.");
    console.log("basketin ici nedi",basketrender);
    res.render("editShoppingBasket", { basketrender });
  } catch (error) {
    console.error("Error fetching basket for editing:", error);
    res.status(500).send("Error fetching basket for editing.");
  }
});
router.post("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { order_date, customer_email } = req.body;

  console.log(`Updating basket with ID ${id}:`, { order_date, customer_email });

  try {
    await updateSql.startTransaction();

    const updateSuccess = await updateSql.updateShoppingBasket({
      id,
      order_date,
      customer_email,
    });
    console.log(`Update success for basket ID ${id}:`, updateSuccess);

    const unlockSuccess = await updateSql.unlockBasket(id);
    console.log(`Unlock success for basket ID ${id}:`, unlockSuccess);

    await updateSql.commitTransaction();
    console.log(`Transaction committed for basket ID ${id}`);
    res.redirect("/admin/shoppingBaskets");
  } catch (error) {
    await updateSql.rollbackTransaction();
    console.error("Error editing shopping basket:", error);
    res.status(500).send("Error editing shopping basket.");
  }
});


// Unlock a basket
router.post("/unlock/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await updateSql.startTransaction();

    await updateSql.unlockBasket(id);

    await updateSql.commitTransaction();
    res.redirect("/admin/shoppingBaskets");
  } catch (error) {
    await updateSql.rollbackTransaction();
    console.error("Error unlocking basket:", error);
    res.status(500).send("Error unlocking basket.");
  }
});

// Unlock all baskets
router.post("/unlockAll", async (req, res) => {
  try {
    await updateSql.startTransaction();

    await updateSql.unlockAllBaskets();

    await updateSql.commitTransaction();

    res.send("All baskets have been unlocked.");
  } catch (error) {
    await updateSql.rollbackTransaction();
    console.error("Error unlocking all baskets:", error);
    res.status(500).send("Error unlocking all baskets.");
  }
});

export default router;

import express from "express";
import logger from "morgan";
import path from "path";
import liveReload from "livereload";
import connectLiveReload from "connect-livereload";

import loginRouter from "./routes/login";
import adminLogin from "./routes/adminLogin";
import adminRouter from "./routes/admin";
import booksRouter from "./routes/books";
import authorsRouther from "./routes/authors"
import awardsRouter from "./routes/awards";
import warehouseRouter from "./routes/warehouses";
import adminShoppingBasketRouter from "./routes/adminBasket";
import hbs from "hbs";

//CUSTOMER
import customerRouter from "./routes/customer";

//HBS
// Register the multiply helper
hbs.registerHelper("multiply", (a, b) => {
  return a * b;
});
const PORT = 3000;

const liveReloadServer = liveReload.createServer();
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

const app = express();

app.use(connectLiveReload());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
// css 경로 설정

app.use(logger("dev"));

//ROUTERS
app.use("/", loginRouter);
app.use("/auth", adminLogin);
app.use("/admin", adminRouter);
app.use("/admin/books", booksRouter);
app.use("/admin/authors", authorsRouther);
app.use("/admin/awards", awardsRouter);
app.use("/admin/warehouses", warehouseRouter);
app.use("/admin/shoppingbaskets", adminShoppingBasketRouter);


// CUSTOMER ROUTES
app.use("/customer", customerRouter);


app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});

import express, { json } from "express";
const app = express();

import auhtorRouter from "./src/modules/author/author.routes.js";
import bookRouter from "./src/modules/book/book.routes.js";
import { db_connection } from "./DB/connection.js";
app.use(json());
app.use("/auhtor", auhtorRouter);
app.use("/book", bookRouter);
db_connection();
app.listen(3004, () => {
  console.log("runing on port 3004");
});

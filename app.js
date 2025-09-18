const express = require("express");
require("dotenv").config();

const app = express();

app.get("/", (req, res) => res.send("Hello, world!"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, (error) => {
  // catch any startup error
  if (error) {
    throw error;
  }
  console.log(`My Inventory app - listening on port ${PORT}!`);
});

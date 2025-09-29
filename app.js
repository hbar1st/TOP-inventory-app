
require("dotenv").config();
const express = require("express");

const app = express();

app.set("view engine", "ejs");

const path = require("node:path");
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true })); //used to parse form body


const inventoryRouter = require("./routes/inventoryRouter");
app.use("/", inventoryRouter);

const deleteRouter = require("./routes/deleteRouter");
const { env } = require("node:process");
app.use("/delete", (req, res, next) => {
  if (req.query.passphrase === process.env.PASSPHRASE) {
    next();
  } else {
    console.log(req.originalUrl);
    res.render("get-pass-phrase", {
      route: req.originalUrl,
      action: 'delete',
    });
  }
},
deleteRouter);

// catch-all for errors
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err);
});


const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use.`);
  } else {
    console.error("Server startup error:", err);
  }
  process.exit(1); // Exit the process if a critical error occurs
});
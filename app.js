
require("dotenv").config();

const { body, query, validationResult } = require("express-validator");
const express = require("express");

const app = express();

app.set("view engine", "ejs");

const path = require("node:path");
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true })); //used to parse form body

const inventoryRouter = require("./routes/inventoryRouter");
app.use("/", inventoryRouter);

const categoryRouter = require("./routes/categoryRouter");
app.use("/categories",
  (req, res, next) => { console.log("in the /categories route: ", req.path, req.method); next(); },
  categoryRouter
);

const { env } = require("node:process");

const deleteRouter = require("./routes/deleteRouter");

app.use(
  "/delete", 
  checkPassPhrase,
  deleteRouter
);


function checkPassPhrase(req, res, next) {
  if (req.body?.passphrase && req.body.passphrase === process.env.PASSPHRASE) {
    console.log("correct passphrase given");
    next();
  } else {
    console.log(req.originalUrl, req.originalUrl.split("/"));
    const messages = [];
    if (req.body?.passphrase) {
      messages.push({ msg: "That's not it. Maybe hana knows the passphrase?" });
    }
    res.render("get-pass-phrase", {
      errors: messages,
      route: req.originalUrl,
      action: "delete",
      origin: req.originalUrl.split("/")[2],
      type: req.type,
      name: req.name
    });
  }
}

// catch-all for errors
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err);
});

//matches any path (so will be a catch-all for the 404 message)
app.use((req, res) => {
  const options = {
    root: path.join(__dirname, "public"),
    dotfiles: "deny",
    headers: {
      "x-timestamp": Date.now(),
      "x-sent": true,
    },
  };
  
  res.status(404).sendFile("./404.html", options, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Sent: 404.html");
    }
  });
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

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

const { env } = require("node:process");


const categoryRouter = require("./routes/categoryRouter");
app.use("/categories{*whatever}",
  (req, res, next) => { console.log("in the /categories route: ", req.path, req.method); next(); },
  categoryRouter
);

const deleteRouter = require("./routes/deleteRouter");
const validatePassphrase = [
  query("passphrase")
  .trim()
  .notEmpty()
  .withMessage("Passphrase can not be empty."),
];
app.get("/{*something}/delete{*whatever}", validatePassphrase,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("get-pass-phrase", {
        errors: errors.array(),
        route: req.originalUrl,
        action: "delete",
        origin: req.originalUrl.split("/")[1],
      });
    } else {
      res.render("get-pass-phrase", {
        errors: [{ msg: "Give hana a coffee if you want the passphrase XD" }],
        route: req.originalUrl,
        action: "delete",
        origin: req.originalUrl.split("/")[1],
      });
    }
  }
);

app.post(
  "/{*something}/delete{*whatever}", 
  
  (req, res, next) => {
    if (req.body.passphrase && (req.body.passphrase === process.env.PASSPHRASE)) {
      console.log("correct passphrase given");
      next();
    } else {
      console.log(req.originalUrl, req.originalUrl.split("/"));
      res.render("get-pass-phrase", {
        errors: [{ msg: "Give hana a coffee if you want the passphrase XD" }],
        route: req.originalUrl,
        action: "delete",
        origin: req.originalUrl.split("/")[1],
      });
    }
  },
  deleteRouter
);

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
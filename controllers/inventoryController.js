
const db = require("../db/queries");

const { body, validationResult } = require("express-validator");


async function getAllCategories(req, res) {
  //res.send("Display a landing page which includes: search form, and a button to view by category, and button to view All and a button to view by brand")
  res.render("index", { allCount: 1000, brandCount: 7, categoryCount: 4 });
}

module.exports = { getAllCategories };

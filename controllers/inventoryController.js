
const db = require("../db/queries");

const { body, validationResult } = require("express-validator");

async function getAllCategories(req, res) {
  res.render("index");
}

async function getAllBrands(req, res) {
  res.render("brands", { allCount: 1000, brandCount: 7, categoryCount: 4 });
}

module.exports = { getAllCategories, getAllBrands };

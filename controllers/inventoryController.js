
const db = require("../db/queries");

const { body, validationResult } = require("express-validator");

async function showLandingPage(req, res) {
  res.render("index");
}

async function getAllBrands(req, res) {
  const viewedRows = req.query.vw ?? 0;
  /*const brands = await db.getAllBrands(viewedRows);
  const item_count = await db.countAllItems();*/
  const [brands, item_count] = await Promise.all([
    db.getAllBrands(viewedRows),
    db.countAllItems()
  ]);
  console.log({ item_count });
  res.render("brands", { viewedRows: brands.viewedRows, brands: brands.rows, item_count });
}

async function getAllCategories(req, res) {
  const viewedRows = req.query.vw ?? 0;
  const [categories, item_count] = await Promise.all([
    db.getAllCategories(viewedRows),
    db.countAllItems(),
  ]);
  console.log(categories.rows);
  res.render("categories", {
    viewedRows: categories.viewedRows,
    categories: categories.rows,
    item_count,
  });
}

module.exports = { showLandingPage, getAllCategories, getAllBrands };

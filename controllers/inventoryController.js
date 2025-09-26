
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

async function getAllItems(req, res) {
  const viewedRows = req.query.vw ?? 0;
  const [items, item_count] = await Promise.all([
    db.getAllItems(viewedRows),
    db.countAllItems(),
  ]);
  console.log(items.rows[5]);
  res.render("items", {
    viewedRows: items.viewedRows,
    items: items.rows,
    item_count,
  });
}

async function getPerfumeDetailsById(req, res) {
  const perfume_id = +req.params.id;
  console.log({perfume_id})
  const [perfume, categories] = await Promise.all([
    db.getPerfumeDetailsById(perfume_id),
    db.getPerfumeCategories(perfume_id),
  ]);
  
  res.render("perfume", {
    details: perfume.rows,
    categories,
  });
  
}

async function search(req, res) {
  console.log("searchText: ",req.query.searchText);
}
module.exports = { search, showLandingPage, getPerfumeDetailsById, getAllCategories, getAllBrands, getAllItems };


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
    db.getAllItems(),
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
  const searchText = req.query.searchText;
  
  // get all available brands and categories in all cases
  const [categories, brands] = await Promise.all([
    db.getAllCategories(),
    db.getAllBrands()
  ]);
  console.log("brands found: ", categories);
  // figure out if this is an id (it will be a number)
  // if not an id, then search for it in descriptin/name/brand_name/category fields and gather all the results for display by type
  // all perfume matches together, all categories together, all brands together
  if (Number.isNaN(Number(searchText))) {
    const perfumes = await Promise.all([
      db.getPerfumesByName(searchText),
      db.getPerfumesByDesc(searchText),
      db.getPerfumesByBrand(searchText),
    ]);
    
    // go thru the list and remove duplicates
    let ids = new Set();
    let perfumeList = [];
    perfumes.flat().forEach((el) => {
      if (!ids.has(el.perfume_id)) {
        ids.add(el.perfume_id);
        perfumeList.push(el);
      }
    });
    
    res.render("perfume", {
      searchText,
      details: perfumeList,
      categories: categories.rows,
      brands: brands.rows,
    });
  } else {
    const perfume_id = Number(searchText);
    const [perfume] = await Promise.all([
      db.getPerfumeDetailsById(perfume_id)
    ]);
    res.render("perfume", {
      searchText,
      details: perfume,
      categories: categories.rows,
      brands: brands.rows,
    });
  }
  
}
module.exports = { search, showLandingPage, getPerfumeDetailsById, getAllCategories, getAllBrands, getAllItems };

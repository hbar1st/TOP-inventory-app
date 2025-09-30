
const db = require("../db/queries");

const { body, validationResult } = require("express-validator");

async function showLandingPage(req, res) {
  res.render("index");
}

async function getAllBrands(req, res) {
  const viewedRows = req.query.vw ?? 0;
  const [brands, item_count] = await Promise.all([
    db.getAllBrands(viewedRows),
    db.countAllItems()
  ]);
  res.render("brands", { viewedRows: brands.viewedRows, brands: brands.rows, item_count });
}

async function getAllCategories(req, res) {
  const viewedRows = req.query.vw ?? 0;
  const [categories, item_count] = await Promise.all([
    db.getAllCategories(viewedRows),
    db.countAllItems(),
  ]);
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
  
  for (let i = 0; i < items.rows.length; i++) {
    const price_id_count_array = items.rows[i].price_id_count;
    console.log(price_id_count_array[0]);
    const count = price_id_count_array.reduce((acc, el) => el[0] ? acc + Number(el[0].split(',')[2]) : 0, 0);
    if (price_id_count_array.length > 1) {
      console.log("found one item with 2 prices: ", items.rows[i].perfume_id, price_id_count_array);
    }
    items.rows[i].count = count;
  }
  res.render("items", {
    viewedRows: items.viewedRows,
    items: items.rows,
    item_count,
  });
}

async function getBrandsForm(req, res) {
  const [brands] = await Promise.all([
    db.getAllBrands(),
  ]);
  res.render("brands-form", {
    errors: null,
    brands: brands.rows,
    add: false
  });
}

async function getPerfumeForm(req, res) {
  const [categories, brands] = await Promise.all([
    db.getAllCategories(),
    db.getAllBrands(),
  ]);
  res.render("perfume", {
    searchText: "",
    details: [],
    categories: categories.rows,
    brands: brands.rows,
    pp_id: null,
    add: true
  });
}

async function addNewPerfume(req, res) {
  console.log(req.query);
}

const validateBrand = [
  body("brand")
  .trim()
  .notEmpty()
  .withMessage("Brand name can not be empty.")
  .custom(async (value) => {
    const brandRow = await db.getBrandByName(value);
    console.log(brandRow);
    if (brandRow.brand_id) {
      console.log("found a duplicate")
      throw new Error("Brand name already exists. Use a new name.");
    }
  })
];

addNewBrand = [validateBrand,
  async function addNewBrand(req, res) {
    console.log("in addNewBrand");
    const [brands] = await Promise.all([db.getAllBrands()]);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("brands-form", {
        errors: errors.array(),
        brands: brands.rows,
        add: true,
      });
    }
    await db.addBrand(req.body.brand);
    res.redirect('/brands/edit');
  }
]

async function getPerfumeDetailsById(req, res) {
  const perfume_id = +req.params.id;
  console.log({perfume_id})
  const [perfume, categories, brands] = await Promise.all([
    db.getPerfumeDetailsById(perfume_id),
    db.getAllCategories(),
    db.getAllBrands()
  ]);
  res.render("perfume", {
    searchText: "",
    details: perfume,
    categories: categories.rows,
    brands: brands.rows,
    pp_id: null,
    add: false,
  });
}

async function getPerfumeByPerfumePriceId(req, res) {
  const perfume_price_id = +req.params.id;
  console.log({ perfume_price_id });
  const [{ perfume_id }, categories, brands] = await Promise.all([
    db.getPerfumeIdByPerfumePriceId(perfume_price_id),
    db.getAllCategories(),
    db.getAllBrands(),
  ]);
  console.log({ perfume_id });
  const perfume = await getPerfumeById(perfume_id);
  res.render("perfume", {
    searchText: "",
    details: perfume,
    categories: categories.rows,
    brands: brands.rows,
    pp_id: perfume_price_id,
    add: false,
  });
}

async function search(req, res) {
  const searchText = req.query.searchText;
  
  // get all available brands and categories in all cases
  const [categories, brands] = await Promise.all([
    db.getAllCategories(),
    db.getAllBrands()
  ]);
  
  // figure out if this is an id (it will be a number)
  // if not an id, then search for it in descriptin/name/brand_name/category fields and gather all the results for display by type
  // all perfume matches together, all categories together, all brands together
  if (Number.isNaN(Number(searchText))) {
    const perfumes = await Promise.all([
      db.getPerfumesByName(searchText),
      db.getPerfumesByDesc(searchText),
      db.getPerfumesByBrand(searchText),
    ]);
    
    // go thru the list and remove duplicates since the 3 queries above are not mutually-exclusive searches
    
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
      pp_id: null,
      add: false,
    });
  } else {
    const perfume_id = Number(searchText);
    const perfume = await getPerfumeById(perfume_id);
    /*
    const [perfume] = await Promise.all([
    db.getPerfumeDetailsById(perfume_id)
    ]);
    */
    res.render("perfume", {
      searchText,
      details: perfume,
      categories: categories.rows,
      brands: brands.rows,
      pp_id: null,
      add: false,
    });
    
  }
  
}

async function getPerfumeById(perfume_id) {
  const [perfume] = await Promise.all([
    db.getPerfumeDetailsById(perfume_id)
  ]);
  console.log("after the await:",perfume);
  return perfume;
}

module.exports = {
  addNewPerfume,
  addNewBrand,
  search,
  showLandingPage,
  getPerfumeByPerfumePriceId,
  getPerfumeForm,
  getBrandsForm,
  getPerfumeDetailsById,
  getAllCategories,
  getAllBrands,
  getAllItems
};

/**
* 
* {
perfume_id: 38,
image_url: 'https://d2k6fvhyk5xgx.cloudfront.net/images/cartier-lheures-voyageuses-oud-&-musc.jpg',
description: 'Eau de parfum',
perfume_name: "Cartier L'Heures Voyageuses Oud & Musc",
avg: '529.8250000000000000',
perfume_price_ids: [ 38, 169 ],
total_count: '4',
brand_id: 2,
brand_name: 'Cartier',
category_list: [ 2, 4 ]
}
*/
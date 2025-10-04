
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
    const count = price_id_count_array.reduce((acc, el) => acc + Number(el.count), 0);
    if (price_id_count_array.length > 1) {
      console.log("found one item with more than one price: ", items.rows[i].perfume_id, price_id_count_array);
      console.log("and the total for that item is: ", count);
    }
    items.rows[i].count = count;
  }
  
  res.render("list-items", {
    viewedRows: items.viewedRows,
    items: items.rows,
    item_count,
  });
}

async function manageBrands(req, res) {
  
  const [brands, brand] = await Promise.all([db.getAllBrands(), db.getBrandById(req.params.id)]);
  res.render("manage-brands", {
    errors: req.params.errormsg ? [{ msg: req.params.errormsg }] : null,
    brands: brands.rows,
    add: false,
    edit: req.params.id ?? false,
    brandName: brand.brand_name,
    brandId: req.params.id,
  });
}

async function getPerfumeForm(req, res) {
  const [categories, brands] = await Promise.all([
    db.getAllCategories(),
    db.getAllBrands(),
  ]);
  res.render("perfume", {
    searchText: "",
    details: [{}],
    categories: categories.rows,
    brands: brands.rows,
    brand_id: null,
    pp_id: null,
    errors: null,
    add: true,
    route: req.originalUrl,
  });
}
/*
{
perfume_id: 174,
image_url: 'https://d2k6fvhyk5xgx.cloudfront.net/images/calvin-klein-defy.jpg',
description: null,
created_at: 2025-10-03T14:44:34.063Z,
perfume_prices: [ [Object], [Object] ],
perfume_name: 'Calvin Klein Defy',
avg_price: '39.9700000000000000',
perfume_price_ids: [ 183, 186 ],
total_count: '18',
brand_id: 1,
brand_name: 'Calvin Klein',
category: [ 8, 9 ]
}
*/
async function showAddStockForm(req, res) {
  const perfume = await db.getPerfumeDetailsById(req.params.id);
  console.log("in showAddStockForm: ", perfume);
  const routeArr = req.originalUrl.split('/');
  routeArr.pop(); //pop the pp_id
  routeArr.push(req.params.id);
  res.render("manage-stock", {
    details: perfume[0],
    errors: req.params.errormsg ? [{ msg: req.params.errormsg }] : null,
    add: true,
    edit: false,
    route: routeArr.join('/'),
  });
}

const validatePerfumePrice = [
  body("price")
  .trim()
  .notEmpty()
    .custom(async (value, { req }) => {
    console.log("in custom perfume price validation function")
    const rows = await db.getPerfumeByPrice(value);
    if (rows && rows.perfume_price_id) {
      throw new Error(
        "Cannot add a duplicate price. You can edit the price stock instead."
      );
    }
  }),
];

addStock = [
  validatePerfumePrice,
  async (req, res) => {
    console.log("in addStock: ", req.params.id, req.body);
    
    const errors = validationResult(req);
    
    const routeArr = req.originalUrl.split("/");
    routeArr.pop(); //pop the pp_id
    routeArr.push(req.params.id);
    //don't add it if it already exists as a combo of perfume_id and price
    if (!errors.isEmpty()) {
      
      const perfume = await db.getPerfumeDetailsById(req.params.id);
      res.status(400).render("manage-stock", {
        details: perfume[0],
        errors: errors.array(),
        add: true,
        edit: false,
        route: routeArr.join('/'),
      });
    } else {
      await db.addStock();
      console.log("about to redirect to: ", req.route);
      res.redirect(req.route);
    }
  }
];

async function updateStock(req, res) {
  console.log("in updateStock: ", req.params.id, req.params.pp_id);
  //TODO
}
const clearBlankFields = (req, res, next) => {
  
  console.log("in clearBlankFields: ", Object.entries(req.body));
  for (const [ key, value ] of Object.entries(req.body)) {
    if (!value) {
      delete req.body[key];
    }
  }
  console.log("in clearBlankFields: ", req.body)
  next();
}


const validatePerfume = [
  body("name")
  .trim()
  .notEmpty()
  .withMessage("Perfume name can not be empty.")
  .custom(async (value, {req}) => {
    if (req.originalUrl.includes("update")) {
      return;
    }
    const perfumeRow = await db.getPerfumeByName(value);
    console.log(perfumeRow);
    if (perfumeRow.perfume_id) {
      console.log("found a duplicate");
      throw new Error(`Perfume name already exists. Use a new name or edit the perfume <a href="/item/${perfumeRow.perfume_id}">here</a>.`);
    }
  }),
  body("image_url")
  .trim()
  .notEmpty()
  .withMessage("The image url field should not be empty.")
  .isURL({
    protocols: ["http", "https"],
    require_tld: true,
    require_protocol: true,
    require_host: true,
    require_port: false,
    require_valid_protocol: true,
    allow_underscores: false,
    host_whitelist: false,
    host_blacklist: false,
    allow_trailing_dot: false,
    allow_protocol_relative_urls: false,
    disallow_auth: false,
    validate_length: true,
  })
  .withMessage("The image_url must be an absolute path to an image online."),
  body("brand").trim().notEmpty().withMessage("A brand must be selected."),
  body("categories")
  .trim()
  .notEmpty()
  .withMessage("A category must be selected."),
  body("create_at").trim().optional(),
  body("price")
  .trim().optional()
  .custom(async (value) => {
    console.log("custom validation for the perfume price");
    priceRegex = /^\d{0,}[.]?\d{0,2}$/m;
    if (!priceRegex.test(value)) {
      console.log("the price is not formatted correctly: ", value);
      throw new Error(
        "The price should be an integer or a decimal value. Do not include currency marks."
      );
    }
    //const perfume_price_id = await db.getPerfumeIdByPrice(req.boyd.id, value);
  }),
  body("count").trim().optional()
  .isInt({ min: 0 }).withMessage("The inventory must be a postive whole number.")
  .custom(async (value, { req }) => {
    if (!req.body.price) {
      throw new Error("To register new inventory, a price must be provided.");
    }
  }),
];
/*

*/
addNewPerfume = [
  validatePerfume,
  async function addNewPerfume(req, res) {
    console.log("in addNewPerfume");
    console.log(req.body);
    
    console.log("custom perfume validation running");
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const [categories, brands] = await Promise.all([
        db.getAllCategories(),
        db.getAllBrands(),
      ]);
      res.status(400).render("perfume", {
        searchText: "",
        details: [req.body],
        categories: categories.rows,
        brands: brands.rows,
        brand_id: null,
        pp_id: null,
        errors: errors.array(),
        add: true,
        route: req.originalUrl,
      });
    } else {
      console.log("validation done: ", req.body);
      const perfume_id = await db.addPerfume(req.body);
      res.redirect(`/item/${perfume_id}`);
    }
  }
];

const validateBrand = [
  body("brand")
  .trim()
  .notEmpty()
  .withMessage("Brand name can not be empty.")
  .custom(async (value) => {
    console.log("custom brand validation running")
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
      return res.status(400).render("manage-brands", {
        errors: errors.array(),
        brands: brands.rows,
        add: true,
        edit: false,
      });
    } else {
      await db.addBrand(req.body.brand);
      res.redirect('/brands/edit');
    }
  }
]

updateBrand = [
  validateBrand,
  async (req, res) => {
    console.log("in updateBrand");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      
      const [brands] = await Promise.all([db.getAllBrands()]);
      return res.status(400).render("manage-brands", {
        errors: errors.array(),
        brands: brands.rows,
        add: false,
        edit: true,
      });
    } else {
      await db.updateBrand(req.params.id, req.body.brand);
      res.redirect("/brands/edit");
    }
  },
];

updatePerfume = [
  validatePerfume,
  async (req, res) => {
    console.log("in updatePerfume: ", req.params.id, req.body);
    
    const errors = validationResult(req);
    console.log(" validation output: ", errors);
    if (!errors.isEmpty()) {
      const [perfume, categories, brands] = await Promise.all([
        db.getPerfumeDetailsById(req.params.id),
        db.getAllCategories(),
        db.getAllBrands(),
      ]);
      res.status(400).render("perfume", {
        searchText: "",
        details: perfume,
        categories: categories.rows,
        brands: brands.rows,
        brand_id: null,
        pp_id: null,
        errors: errors.array(),
        add: false,
        route: req.originalUrl,
      });
    } else {
      console.log("validation done: ", req.body);
      await db.updatePerfume(req.params.id, req.body);
      console.log("redirecting with message");
      res.redirect("/item/"+req.params.id+"?message=Update complete.");
    }
    
  }];
  
  async function getPerfumeDetailsById(req, res) {
    const perfume_id = +req.params.id;
    console.log("in getPerfumeDetailsById: ", { perfume_id }, req.query.message);
    const [perfume, categories, brands] = await Promise.all([
      db.getPerfumeDetailsById(perfume_id),
      db.getAllCategories(),
      db.getAllBrands()
    ]);
    res.render("perfume", {
      searchText: req.params.id,
      details: perfume,
      categories: categories.rows,
      brands: brands.rows,
      brand_id: null,
      pp_id: null,
      errors: null,
      add: false,
      route: req.originalUrl,
      bannerMessage: req.query.message,
    });
  }
  /*
  {
  perfume_id: 193,
  image_url: 'https://d2k6fvhyk5xgx.cloudfront.net/images/ck-one-shock.jpg',
  description: null,
  created_at: 2025-10-02T13:38:33.094Z,
  perfume_prices: [ [Object] ],
  perfume_name: 'Ck One Shock',
  avg_price: '44.9900000000000000',
  perfume_price_ids: [ 181 ],
  total_count: null,
  brand_id: 1,
  brand_name: 'Calvin Klein',
  category_list: [ 10 ]
  }
  */
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
      brand_id: null,
      pp_id: perfume_price_id,
      errors: null,
      add: false,
      route: req.originalUrl,
    });
  }
  
  async function searchByCategoryId(req,res) {
    const category_id = req.params.id;
    console.log("in searchByCategoryId: ", category_id);
    const [categories, brands, perfumeList] = await Promise.all([
      db.getAllCategories(),
      db.getAllBrands(),
      db.getPerfumesByCategoryId(category_id)
    ]);
    
    res.render("perfume", {
      searchText: "",
      details: perfumeList,
      categories: categories.rows,
      brands: brands.rows,
      brand_id: null,
      pp_id: null,
      errors: null,
      add: false,
      route: req.originalUrl,
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
        brand_id: null,
        pp_id: null,
        errors: null,
        add: false,
        route: req.originalUrl,
      });
    } else {
      const perfume_id = Number(searchText);
      const perfume = await getPerfumeById(perfume_id);
      
      res.render("perfume", {
        searchText,
        details: perfume,
        categories: categories.rows,
        brands: brands.rows,
        brand: brand_id,
        pp_id: null,
        errors: null,
        add: false,
        route: req.originalUrl,
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
    searchByCategoryId,
    showLandingPage,
    getPerfumeByPerfumePriceId,
    getPerfumeForm,
    manageBrands,
    getPerfumeDetailsById,
    getAllCategories,
    getAllBrands,
    getAllItems,
    updateBrand,
    updatePerfume,
    clearBlankFields,
    showAddStockForm,
    updateStock,
    addStock
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
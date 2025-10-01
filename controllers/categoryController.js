
const { name } = require("ejs");
const db = require("../db/queries");

const { body, validationResult } = require("express-validator");


async function getAllCategories(req, res) {
  console.log("in getAllCategories");
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


async function manageCategories(req, res) {
  
  const [categories, category] = await Promise.all(
    [
      db.getAllCategories(),
      db.getCategoryDetailsById(req.params.id)
    ]
  );
  console.log("in manageCategories: ", category);
  res.render("manage-categories", {
    errors: null,
    categories: categories.rows,
    add: false,
    edit: req.params.id ?? false,
    category: category.rows,
  });
}

body("confirmPassword").custom((value, { req }) => {
  if (value !== req.body.password) {
    throw new Error("Password confirmation does not match password");
  }
  return true; // Return true if validation passes
});

const validateCategory = [
  body("type")
  .trim()
  .notEmpty()
  .withMessage("Category type must not be empty."),
  body("name")
  .trim()
  .notEmpty()
  .withMessage("Category name must not be empty.")
  .custom(async (value, { req }) => {
    const categoryRow = await db.getCategory(value, req.body.type);
    console.log(categoryRow);
    if (categoryRow.category_id) {
      console.log("found a duplicate");
      throw new Error("Category already exists. Use a new name and/or type.");
    }
  })
];

updateCategory = [
  validateCategory,
  async function updateCategory(req, res) {
    console.log("in updateCategory: ", req.params.id, req.body.name, req.body.type);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const [categories] = await Promise.all([db.getAllCategories()]);
      return res.status(400).render("manage-categories", {
        errors: errors.array(),
        categories: categories.rows,
        add: true,
        edit: false,
        category: {type: req.body.category_type, category_name: req.body.category_name, category_id: req.params.id}
      });
    }
    await db.updateCategory(req.params.id, req.body.type, req.body.name);
    res.redirect("/categories/edit");
  },
];
addNewCategory = [
  validateCategory,
  async function addNewCategory(req, res) {
    console.log("in addNewCategory");
    const [categories] = await Promise.all([db.getAllCategories()]);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("manage-categories", {
        errors: errors.array(),
        categories: categories.rows,
        add: true,
        edit: false,
        category: {}
      });
    }
    await db.addCategory(req.body.category-name, req.body.category-type);
    res.redirect("/categories/edit");
  },
];

module.exports = {
  addNewCategory,
  manageCategories,
  getAllCategories,
  updateCategory,
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
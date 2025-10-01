
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
    [db.getAllCategories(),
    db.getCategoryDetailsById(req.params.id)]);
      res.render("manage-categories", {
        errors: null,
        categories: categories.rows,
        add: false,
        edit: req.params.id ?? false,
        category,
      });
    }
    
    module.exports = {
      manageCategories,
      getAllCategories,
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
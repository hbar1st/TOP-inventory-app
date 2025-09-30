const { Router } = require("express");
const {
  getAllCategories,
  manageCategories,
} = require("../controllers/categoryController");

const categoryRouter = Router();

categoryRouter.get("/categories", getAllCategories);

categoryRouter.get(["/categories/edit", "/categories/edit/:id"], manageCategories);

//categoryRouter.post("/categories/add", addNewCategory);

module.exports = categoryRouter;

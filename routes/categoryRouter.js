const { Router } = require("express");
const {
  getAllCategories,
  manageCategories,
  addNewCategory,
  updateCategory,
} = require("../controllers/categoryController");

const categoryRouter = Router();

categoryRouter.get("/", getAllCategories);

categoryRouter.get(["/edit", "/edit/:id", "/edit/:id/error/:errormsg"], manageCategories);

categoryRouter.post("/update/:id", updateCategory)

categoryRouter.post("/add", addNewCategory);

module.exports = categoryRouter;

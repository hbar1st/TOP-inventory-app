const { Router } = require("express");
const {
  getAllCategories,
  manageCategories,
} = require("../controllers/categoryController");

const categoryRouter = Router();

categoryRouter.get("/", getAllCategories);

categoryRouter.get(["/edit", "/edit/:id"], manageCategories);

//categoryRouter.post("/add", addNewCategory);

module.exports = categoryRouter;

const { Router } = require("express");
const {
  deleteBrand,
  deleteCategory,
  deletePerfume,
} = require("../controllers/deleteController");

const deleteRouter = Router();

deleteRouter.post("/brands/:id", deleteBrand);

deleteRouter.post("/items/:id", deletePerfume);

deleteRouter.post("/categories/:id", deleteCategory);

module.exports = deleteRouter;

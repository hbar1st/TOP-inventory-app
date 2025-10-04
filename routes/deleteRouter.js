const { Router } = require("express");
const {
  deleteBrand,
  deleteCategory,
  deletePerfume,
  deleteStock,
} = require("../controllers/deleteController");

const deleteRouter = Router();

deleteRouter.post("/brands/:id", deleteBrand);

deleteRouter.post("/items/:id", deletePerfume);

deleteRouter.post("/categories/:id", deleteCategory);

deleteRouter.post(["/stock/:id/:pp_id", "/stock/edit/:id/:pp_id"], deleteStock);

module.exports = deleteRouter;

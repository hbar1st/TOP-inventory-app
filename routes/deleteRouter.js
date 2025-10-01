const { Router } = require("express");
const {
  deleteBrand,
  deleteCategory,
} = require("../controllers/deleteController");

const deleteRouter = Router();

deleteRouter.post("/brands/:id", deleteBrand);


deleteRouter.post("/categories/:id", deleteCategory);

module.exports = deleteRouter;

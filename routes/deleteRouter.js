const { Router } = require("express");
const {
  deleteBrand,
} = require("../controllers/deleteController");

const deleteRouter = Router();

deleteRouter.get("/delete/brand/:id", deleteBrand)

module.exports = deleteRouter;

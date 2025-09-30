const { Router } = require("express");
const {
  deleteBrand,
} = require("../controllers/deleteController");

const deleteRouter = Router();

deleteRouter.post("/brands/delete/:id", deleteBrand);

module.exports = deleteRouter;

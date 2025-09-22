
const { Router } = require("express");
const { getAllCategories } = require("../controllers/inventoryController");

const inventoryRouter = Router();

inventoryRouter.get("/", getAllCategories);

module.exports = inventoryRouter;
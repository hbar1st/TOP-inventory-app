
const { Router } = require("express");
const { getAllCategories, getAllBrands } = require("../controllers/inventoryController");

const inventoryRouter = Router();

inventoryRouter.get("/", getAllCategories);

inventoryRouter.get("/brands", getAllBrands);

module.exports = inventoryRouter;
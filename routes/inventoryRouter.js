
const { Router } = require("express");
const { showLandingPage, getAllItems, getAllCategories, getAllBrands } = require("../controllers/inventoryController");

const inventoryRouter = Router();

inventoryRouter.get("/", showLandingPage);

inventoryRouter.get("/brands", getAllBrands);

inventoryRouter.get("/categories", getAllCategories);

inventoryRouter.get("/items", getAllItems);

module.exports = inventoryRouter;
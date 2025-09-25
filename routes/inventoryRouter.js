
const { Router } = require("express");
const { showLandingPage, getAllCategories, getAllBrands } = require("../controllers/inventoryController");

const inventoryRouter = Router();

inventoryRouter.get("/", showLandingPage);

inventoryRouter.get("/brands", getAllBrands);

inventoryRouter.get("/categories", getAllCategories);

module.exports = inventoryRouter;
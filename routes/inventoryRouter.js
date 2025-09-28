
const { Router } = require("express");
const { search, showLandingPage, getPerfumeForm, getPerfumeDetailsById, getAllItems, getAllCategories, getAllBrands } = require("../controllers/inventoryController");

const inventoryRouter = Router();

inventoryRouter.get("/", showLandingPage);

inventoryRouter.get("/brands", getAllBrands);

inventoryRouter.get("/categories", getAllCategories);

inventoryRouter.get("/items", getAllItems);

inventoryRouter.get("/item/:id", getPerfumeDetailsById);

inventoryRouter.get("/search", search);

inventoryRouter.get("/add", getPerfumeForm)

module.exports = inventoryRouter;
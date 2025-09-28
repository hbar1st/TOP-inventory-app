
const { Router } = require("express");
const {
  addNewPerfume,
  search,
  showLandingPage,
  getPerfumeByPerfumePriceId,
  getPerfumeForm,
  getPerfumeDetailsById,
  getAllItems,
  getAllCategories,
  getAllBrands,
} = require("../controllers/inventoryController");

const inventoryRouter = Router();

inventoryRouter.get("/", showLandingPage);

inventoryRouter.get("/brands", getAllBrands);

inventoryRouter.get("/categories", getAllCategories);

inventoryRouter.get("/items", getAllItems);

inventoryRouter.get("/item/:id", getPerfumeDetailsById);

inventoryRouter.get("/search", search);

inventoryRouter.get("/add", getPerfumeForm);

inventoryRouter.get("/perfume-price-id/:id", getPerfumeByPerfumePriceId);

inventoryRouter.post("/add", addNewPerfume);

module.exports = inventoryRouter;

const { Router } = require("express");
const {
  addNewPerfume,
  addNewBrand,
  search,
  searchByCategoryId,
  showLandingPage,
  getPerfumeByPerfumePriceId,
  getPerfumeForm,
  manageBrands,
  getPerfumeDetailsById,
  getAllItems,
  getAllBrands,
  updateBrand
} = require("../controllers/inventoryController");


const inventoryRouter = Router();

inventoryRouter.get("/", showLandingPage);

inventoryRouter.get("/items", getAllItems);

inventoryRouter.get("/item/:id", getPerfumeDetailsById);

inventoryRouter.get("/search", search);

inventoryRouter.get("/search/category/:id", searchByCategoryId);

inventoryRouter.get("/add", getPerfumeForm);

inventoryRouter.post("/add", addNewPerfume);

inventoryRouter.get("/perfume-price-id/:id", getPerfumeByPerfumePriceId);

inventoryRouter.get("/brands", getAllBrands);

inventoryRouter.get(["/brands/edit", "/brands/edit/:id"], manageBrands);

inventoryRouter.post("/brands/update/:id", updateBrand)

inventoryRouter.post("/brands/add", addNewBrand);

module.exports = inventoryRouter;
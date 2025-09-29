
const { Router } = require("express");
const {
  addNewPerfume,
  addNewBrand,
  search,
  showLandingPage,
  getPerfumeByPerfumePriceId,
  getPerfumeForm,
  getBrandsForm,
  getPerfumeDetailsById,
  getAllItems,
  getAllCategories,
  getAllBrands,
} = require("../controllers/inventoryController");


const inventoryRouter = Router();

inventoryRouter.get("/", showLandingPage);

inventoryRouter.get("/categories", getAllCategories);

inventoryRouter.get("/items", getAllItems);

inventoryRouter.get("/item/:id", getPerfumeDetailsById);

inventoryRouter.get("/search", search);

inventoryRouter.get("/add", getPerfumeForm);

inventoryRouter.get("/perfume-price-id/:id", getPerfumeByPerfumePriceId);

inventoryRouter.get("/brands", getAllBrands);

inventoryRouter.get("/brands/edit", getBrandsForm);

inventoryRouter.post("/add", addNewPerfume);

inventoryRouter.post("/add/brand", addNewBrand);



//inventoryRouter.post("/add/category", addNewCategory);

module.exports = inventoryRouter;
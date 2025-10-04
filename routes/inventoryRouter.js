
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
  updateBrand,
  updatePerfume,
  clearBlankFields,
  showAddStockForm,
  updateStock,
  addStock,
} = require("../controllers/inventoryController");


const inventoryRouter = Router();

inventoryRouter.get("/", showLandingPage);

inventoryRouter.get("/items", getAllItems);

inventoryRouter.get("/item/:id", getPerfumeDetailsById);

inventoryRouter.get("/search", search);

inventoryRouter.get("/search/category/:id", searchByCategoryId);

inventoryRouter.get("/add", getPerfumeForm);

inventoryRouter.post("/add", clearBlankFields, addNewPerfume);

inventoryRouter.get(["/stock/:id", "/stock/edit/:id", "/stock/:id/:pp_id"], showAddStockForm);

inventoryRouter.post("/stock/add/:id", addStock);

inventoryRouter.get("/stock/update/:id/:pp_id", updateStock);

inventoryRouter.post("/update/:id", clearBlankFields,updatePerfume);

inventoryRouter.get("/perfume-price-id/:id", getPerfumeByPerfumePriceId);

inventoryRouter.get("/brands", getAllBrands);

inventoryRouter.get(["/brands/edit", "/brands/edit/:id", "brands/edit/:id/error/:errormsg"], manageBrands);

inventoryRouter.post("/brands/update/:id", updateBrand)

inventoryRouter.post("/brands/add", addNewBrand);

module.exports = inventoryRouter;
const { Router } = require("express");
const {
  deleteBrand,
} = require("../controllers/deleteController");

const deleteRouter = Router();

deleteRouter.post("/brands/delete/:id", (req, res) => { console.log('made it this far') },deleteBrand)

module.exports = deleteRouter;

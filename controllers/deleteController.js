const db = require("../db/queries");

const { body, validationResult } = require("express-validator");

async function deleteBrand(req, res) {
  console.log("in deleteBrand");
  await db.deleteBrand(req.params.id);
  res.redirect("/brands/edit");
}

module.exports = {
  deleteBrand,
}
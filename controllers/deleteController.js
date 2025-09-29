const db = require("../db/queries");

const { body, validationResult } = require("express-validator");

async function deleteBrand(req, res) {
  await db.deleteBrand(req.params.id);
  res.redirect("/edit/brands");
}

module.exports = {
  deleteBrand,
}
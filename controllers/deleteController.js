const db = require("../db/queries");

const { body, validationResult } = require("express-validator");

async function deleteBrand(req, res) {
  console.log("in deleteBrand");
  
  const count = await db.getBrandCount();
  console.log({ count });
  if (+count > 1) {
    await db.deleteBrand(req.params.id);
    res.redirect("/brands/edit");
  } else {
    const errormsg = "You cannot remove the last brand.";
    res.redirect(`/brands/edit/${req.params.id}/error/${errormsg}`);
  }
}

async function deleteCategory(req, res) {
  console.log("in deleteCategory");
  const count = await db.getCategoryCount();
  
  console.log({ count });
  if (+count > 1) {
    await db.deleteCategory(req.params.id);
    res.redirect("/categories/edit");
  } else {
    const errormsg = 'You cannot remove the last category.';
    res.redirect(`/categories/edit/${req.params.id}/error/${errormsg}`);
  }
}

async function deletePerfume(req, res) {
  console.log("in deletePerfume: ", req.params.id, req.query);
  await db.deletePerfume(req.params.id);
  res.redirect(req.query.route);
}

module.exports = {
  deleteBrand,
  deleteCategory,
  deletePerfume,
}
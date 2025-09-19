require("express");
const { pool } = require("./pool");

async function getPerfumeByName(name) {
  console.log("in getPerfumeByName: ", name);
  const { rows } = await pool.query("SELECT * FROM perfumes WHERE perfume_name ILIKE $1", [name]);
  
  console.log("in getPerfumeByName: ", rows);
  return rows.length > 0 ? rows[0] : {};
}

async function getCategory(name, type) {
  console.log("in getCategory: ", name);
  const { rows } = await pool.query(
    "SELECT category_id FROM categories WHERE category_name ILIKE $1 AND type ILIKE $2",
    [name, type]
  );
  
  console.log("in getCategory: ", rows);
  return rows.length > 0 ? rows[0] : {};
}

async function setPerfumeCategory(perfume_id, category_name, category_type) {
  const category = await getCategory(category_name, category_type);
  if (category.category_id && perfume_id) {
    await pool.query(
      "INSERT INTO perfume_category (category_id, perfume_id) VALUES ($1,$2);",
      [category.category_id, perfume_id]
    );
  } else {
    const message = `One of the values given to setPerfumeCategory for perfume_id or brand_id are null: ${perfume_id}, ${category.category_id}`;
    console.log(message);
    throw new Error(message);
  }
}

async function getPerfumePriceId(perfume_id) {
  console.log("in getPerfumePriceId: ", perfume_id);
  const { rows } = await pool.query(
    "SELECT perfume_price_id FROM perfume_price WHERE perfume_id=$1",
    [perfume_id]
  );

  console.log("in getPerfumePriceId: ", rows);
  return rows.length > 0 ? rows[0] : {};
}

async function setPerfumeInventory(perfume_id, count) {
  const perfumePriceRow = await getPerfumePriceId(perfume_id);
  if (perfumePriceRow.perfume_price_id) {
    await pool.query(
      "INSERT INTO inventory (perfume_price_id, count) VALUES ($1,$2);",
      [perfumePriceRow.perfume_price_id, count]
    );
  } else {
    throw new Error("Failed to set the perfume's inventory");
  }
}

async function setPerfumePrice(perfume_id, price) {
  console.log("in setPerfumePrice: ",perfume_id,price);
  await pool.query("INSERT INTO perfume_price (perfume_id, price) VALUES ($1,$2);", [perfume_id, price]);
}

async function getBrandByName(name) {
  
  console.log("in getBrandByName: ", name);
  const { rows } = await pool.query(
    "SELECT brand_id FROM brands WHERE brand_name ILIKE $1",
    [name]
  );
  
  console.log("in getBrandByName: ", rows);
  return rows.length > 0 ? rows[0] : {};
}

async function setPerfumeBrand(perfume_id, brand_name) {
  const brand = await getBrandByName(brand_name);
  if (brand.brand_id && perfume_id) {
    await pool.query("INSERT INTO perfume_brand (brand_id, perfume_id) VALUES ($1,$2);", [brand.brand_id, perfume_id]);
  } else {
    const message = `One of the values for perfume_id or brand_id are null: ${perfume_id}, ${brand.brand_id}`;
    console.log(message);
    throw (new Error(message));
    
  }
}


async function updatePerfume(data) {
  /*
  const text =
  "UPDATE messages SET text = $1, username=$2, added=$3 WHERE id=$4";
  console.log("my query: ", text);
  const values = [textmsg, author, timestamp, id];
  
  await pool.query(text, values);
  */
  // make this work for any object with any set of columns so long as the perfume_name or the perfume_id is provided
  const keys = Object.keys(data);
}
module.exports = {
  getPerfumeByName,
  getCategory,
  getBrandByName,
  getPerfumePriceId,
  setPerfumeBrand,
  setPerfumeCategory,
  setPerfumePrice,
  setPerfumeInventory,
};
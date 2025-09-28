require("express");
const CustomNotFoundError = require("../Errors/CustomNotFoundError");

const { pool } = require("./pool");
const LIMIT_SETTING = 50;

async function getPerfumesByCategoryDetails(detail) {
  console.log("in getPerfumesByCategoryDetails: ", detail);
  const { rows } = await pool.query(
    `SELECT 
    p.perfume_id,
    p.description,
    p.image_url,
    p.created_at,
    REPLACE(p.perfume_name, '''''', '''') as perfume_name,
    AVG(price),
    ARRAY_AGG(DISTINCT perfume_price_id) as perfume_price_ids,
    SUM(count) as total_count,
    pb.brand_id,
    brand_name,
    type,
    category_name,
    ARRAY_AGG(DISTRICT category_id) AS category_list
    FROM perfumes as p
    LEFT JOIN perfume_brand AS pb USING(perfume_id)
    LEFT JOIN brands USING(brand_id)
    LEFT JOIN perfume_category USING(perfume_id)
    LEFT JOIN categories USING(category_id)
    LEFT JOIN perfume_price USING (perfume_id)
    LEFT JOIN inventory USING (perfume_price_id)
    WHERE type ILIKE $1 OR category_name ILIKE $1
    GROUP BY p.perfume_id, category_name, categories.type, pb.brand_id, brands.brand_name
    ORDER BY perfume_name;`,
    [`%${detail}%`]
  );
  
  console.log("in getPerfumesByCategoryDetails: ", detail);
  return rows;
}

async function getPerfumesByBrand(brand) {
  console.log("in getPerfumesByBrand: ", brand);
  const { rows } = await pool.query(
    `SELECT 
    p.perfume_id,
    p.description,
    p.image_url,
    p.created_at,
    REPLACE(p.perfume_name, '''''', '''') as perfume_name,
    AVG(price),
    ARRAY_AGG(DISTINCT perfume_price_id) as perfume_price_ids,
    SUM(count) as total_count,
    pb.brand_id,
    brand_name,
    ARRAY_AGG(DISTINCT category_id) AS category_list
    FROM perfumes as p
    LEFT JOIN perfume_brand as pb USING (perfume_id)
    LEFT JOIN brands USING (brand_id)
    LEFT JOIN perfume_category USING (perfume_id)
    LEFT JOIN categories USING (category_id)
    LEFT JOIN perfume_price USING (perfume_id)
    LEFT JOIN inventory USING (perfume_price_id)
    WHERE brand_name ILIKE $1
    GROUP BY p.perfume_id,pb.brand_id,brand_name
    ORDER BY perfume_name;`,
    [`%${brand}%`]
  );
  
  console.log("in getPerfumesByBrand: ", rows);
  return rows;
}

async function getPerfumesByName(name) {
  console.log("in getPerfumesByName: ", name);
  const { rows } = await pool.query(
    `SELECT 
    p.perfume_id,
    p.description,
    p.image_url,
    p.created_at,
    REPLACE(p.perfume_name, '''''', '''') as perfume_name,
    AVG(price),
    ARRAY_AGG(DISTINCT perfume_price_id) as perfume_price_ids,
    SUM(count) as total_count,
    pb.brand_id,
    brand_name,
    ARRAY_AGG(DISTINCT category_id) AS category_list
    FROM perfumes AS p
    LEFT JOIN perfume_brand as pb USING (perfume_id)
    LEFT JOIN brands USING (brand_id)
    LEFT JOIN perfume_category USING (perfume_id)
    LEFT JOIN categories USING (category_id)
    LEFT JOIN perfume_price USING (perfume_id)
    LEFT JOIN inventory USING (perfume_price_id)
    WHERE perfume_name ILIKE $1 GROUP BY p.perfume_id,pb.brand_id,brand_name
    ORDER BY perfume_name;`,
    [`%${name}%`]
  );
  
  console.log("in getPerfumesByName: ", rows);
  return rows;
}

async function getPerfumesByDesc(word) {
  console.log("in getPerfumeByDesc: ", word);
  const { rows } = await pool.query(
    `SELECT 
    p.perfume_id,
    p.description,
    p.image_url,
    p.created_at,
    REPLACE(p.perfume_name, '''''', '''') as perfume_name,
    AVG(price),
    ARRAY_AGG(DISTINCT perfume_price_id) as perfume_price_ids,
    SUM(count) as total_count,
    pb.brand_id,
    brand_name,
    ARRAY_AGG(DISTINCT category_id) AS category_list FROM perfumes AS p
    LEFT JOIN perfume_brand as pb USING (perfume_id)
    LEFT JOIN brands USING (brand_id)
    LEFT JOIN perfume_category USING (perfume_id)
    LEFT JOIN categories USING (category_id)
    LEFT JOIN perfume_price USING (perfume_id)
    LEFT JOIN inventory USING (perfume_price_id)
    WHERE description ILIKE $1
    GROUP BY p.perfume_id,pb.brand_id,brand_name
    ORDER BY perfume_name;`,
    [`%${word}%`]
  );
  
  console.log("in getPerfumeByDesc: ", rows);
  return rows;
}

async function countAllItems() {
  const { rows } = await pool.query("SELECT COUNT(*) FROM perfume_brand;");
  console.log("in countAllItems: ", rows);
  return rows[0].count;
}
/**
* keep in mind that we want to order the returned rows in case there are more rows than the LIMIT_SETTING allows
* per query. This way, we can try to return the next set of rows if the user invokes a 'view more' link.
* 
* @returns 
*/
async function getAllBrands(viewedRows = 0) {
  console.log("in getAllBrands query: ", viewedRows);
  const { rows } = await pool.query(
    "SELECT b.brand_id, brand_name, COUNT(perfume_id) AS perfume_count FROM brands AS b LEFT JOIN perfume_brand USING (brand_id) GROUP BY b.brand_id ORDER BY brand_name LIMIT ($2) OFFSET $1;",
    [viewedRows, LIMIT_SETTING]
  );
  
  console.log("in getAllBrands: ", rows);
  return { rows, viewedRows: rows.length + viewedRows };
}
async function getAllCategoryTypes() {
  console.log("in getAllCategoryTypes ");
  //TODO fill this in?
  console.log("in getAllCategoryTypes: ", );
}
async function getAllCategories(viewedRows=0) {
  console.log("in getAllCategories: ", viewedRows);
  const { rows } = await pool.query(
    "SELECT c.category_id, type, category_name, COUNT(perfume_id) AS perfume_count FROM categories AS c LEFT JOIN perfume_category AS p USING (category_id) GROUP BY type,c.category_name,c.category_id ORDER BY type LIMIT ($2) OFFSET $1;",
    [viewedRows, LIMIT_SETTING]
  );
  
  console.log("in getAllCategories: ", rows);
  return { rows, viewedRows: rows.length + viewedRows };
}

async function getAllItems(viewedRows=0) {
  console.log("in getAllItems: ", viewedRows);
  const { rows } = await pool.query(
    `
    SELECT perfume_id,image_url,REPLACE(perfume_name, '''''', '''') as perfume_name,brand_name,description,ARRAY_AGG(prices) as price_id_count
    FROM
      (SELECT perfume_id,image_url,perfume_name,brand_name,description,ARRAY_AGG(price || ',' || perfume_price_id || ',' || count) AS prices
      FROM perfumes AS p
      LEFT JOIN perfume_price USING (perfume_id)
      LEFT JOIN inventory USING (perfume_price_id)
      LEFT JOIN perfume_brand USING (perfume_id)
      LEFT JOIN brands USING (brand_id)
      GROUP BY perfume_id,brands.brand_name,inventory.count,description
      ORDER BY perfume_name)
      AS subquery
    GROUP BY perfume_id,perfume_name,brand_name,image_url,description
    LIMIT ($2) OFFSET $1;
    `,
    [viewedRows, 200]
  );
  console.log("in getAllItems: ", rows.length);
  return { rows, viewedRows: rows.length + viewedRows };
}

async function getPerfumeDetailsById(id) {
  console.log("in getPerfumeDetailsById: ", id);
  const { rows } = await pool.query(
    `SELECT DISTINCT p.perfume_id,
    image_url,
    description,
    REPLACE(perfume_name, '''''', '''') as perfume_name,
    AVG(price),
    ARRAY_AGG(DISTINCT perfume_price_id) as perfume_price_ids,
    SUM(count) as total_count,
    brand_id,
    brand_name,
    ARRAY_AGG(DISTINCT category_id) AS category_list
    FROM perfumes AS p
    LEFT JOIN perfume_price USING (perfume_id)
    LEFT JOIN inventory USING (perfume_price_id)
    LEFT JOIN perfume_brand USING (perfume_id)
    LEFT JOIN brands USING (brand_id)
    LEFT JOIN perfume_category USING (perfume_id)
    LEFT JOIN categories USING (category_id)
    WHERE perfume_id=$1
    GROUP BY p.perfume_id,brand_id,brand_name;`,
    [`${id}`]
  );
  
  console.log("in getPerfumeDetailsById: ", rows);
  return rows;
}

async function getPerfumeCategories(id) {
  console.log("in getPerfumeCategories: ", id);
  const { rows } = await pool.query(
    "SELECT perfume_id,c.* FROM perfume_category AS p LEFT JOIN categories AS c USING (category_id) WHERE perfume_id=$1 GROUP BY type,c.category_name,c.category_id,p.perfume_id ORDER BY type ;",
    [id]
  );
  
  console.log("in getPerfumeCategories: ", rows);
  return rows;
}

async function getCategory(name, type) {
  console.log("in getCategory: ", name);
  const { rows } = await pool.query(
    "SELECT category_id FROM categories WHERE category_name ILIKE $1 AND type ILIKE $2;",
    [`%${name}%`, `%${type}%`]
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
    throw new CustomNotFoundError(message);
  }
}

async function getPerfumePriceId(perfume_id) {
  console.log("in getPerfumePriceId: ", perfume_id);
  const { rows } = await pool.query(
    "SELECT perfume_price_id FROM perfume_price WHERE perfume_id=$1;",
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
    "SELECT brand_id FROM brands WHERE brand_name ILIKE $1;",
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

async function addPerfumeCategory(perfume_id, category_id) {
  console.log("In addPerfumeCategory: ", perfume_id, category_id);
  if (perfume_id && category_id) {
    const id = await pool.query(
      "INSERT INTO perfume_category (perfume_id, category_id) VALUES ($1,$2);",
      [perfume_id, category_id]
    );
  } else {
    const message = `One of the values for perfume_id or category_id are null: ${perfume_id}, ${category_id}`;
    console.log(message);
    throw new Error(message);
  }
}

async function addCategory(name, type) {
  if (name && type) {
    const id = await pool.query(
      "INSERT INTO categories (category_name, type) VALUES ($1,$2) RETURNING category_id;",
      [name, type]
    );
    console.log("in addCategory: ", id.rows[0].category_id);
    return id.rows[0].category_id;
  } else {
    const message = `One of the values for category_name or type are null: ${name}, ${type}`;
    console.log(message);
    throw new Error(message);
  }
}

/*
const text =
"UPDATE messages SET text = $1, username=$2, added=$3 WHERE id=$4";
console.log("my query: ", text);
const values = [textmsg, author, timestamp, id];

await pool.query(text, values);
*/
// make this work for any object with any set of columns so long as the perfume_name or the perfume_id is provided
//const keys = Object.keys(data);

module.exports = {
  addCategory,
  addPerfumeCategory,
  getAllItems,
  getAllBrands,
  getAllCategories,
  getAllCategoryTypes,
  getPerfumesByName,
  getPerfumesByDesc,
  getPerfumesByBrand,
  getPerfumesByCategoryDetails,
  getPerfumeDetailsById,
  getPerfumeCategories,
  getCategory,
  getBrandByName,
  getPerfumePriceId,
  setPerfumeBrand,
  setPerfumeCategory,
  setPerfumePrice,
  setPerfumeInventory,
  countAllItems,
};
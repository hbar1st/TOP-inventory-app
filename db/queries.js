require("express");
const CustomNotFoundError = require("../Errors/CustomNotFoundError");

const { pool } = require("./pool");
const LIMIT_SETTING = 500;

async function getPerfumesByCategoryId(id) {
  console.log("in getPerfumesByCategoryId: ", id);
  const { rows } = await pool.query(
    `SELECT 
    p.perfume_id,
    p.description,
    p.image_url,
    p.created_at,
    (
    SELECT JSON_AGG(JSON_BUILD_OBJECT(
      'pp_id', sub.pp_id,
      'pp_price', sub.pp_price,
      'pp_count', sub.pp_count
    ))
    FROM (
      SELECT DISTINCT
        pp.perfume_price_id AS pp_id,
        pp.price AS pp_price,
        i.count AS pp_count
      FROM perfume_price pp
      LEFT JOIN inventory i USING (perfume_price_id)
      WHERE pp.perfume_id = p.perfume_id
      GROUP BY pp.perfume_id,pp_id,pp.price,i.count
    ) sub
  ) AS perfume_prices,
    REPLACE(p.perfume_name, '''''', '''') as perfume_name,
    AVG(price) AS avg_price,
    ARRAY_AGG(DISTINCT perfume_price_id) as perfume_price_ids,
    SUM(count) as total_count,
    pb.brand_id,
    brand_name,
    type,
    category_name,
    ARRAY_AGG(DISTINCT category_id) AS category
    FROM perfumes as p
    LEFT JOIN perfume_brand AS pb USING(perfume_id)
    LEFT JOIN brands USING(brand_id)
    LEFT JOIN perfume_category USING(perfume_id)
    LEFT JOIN categories USING(category_id)
    LEFT JOIN perfume_price USING (perfume_id)
    LEFT JOIN inventory USING (perfume_price_id)
    WHERE category_id=$1
    GROUP BY p.perfume_id, category_name, categories.type, pb.brand_id, brands.brand_name
    ORDER BY perfume_name;`,
    [id]
  );
  
  console.log("in getPerfumesByCategoryId: ", id);
  return rows;
}

/**
 * matches anything that has a brand that contains the brand name provided
 * @param {*} brand 
 * @returns 
 */
async function getPerfumesByBrand(brand) {
  console.log("in getPerfumesByBrand: ", brand);
  const { rows } = await pool.query(
    `SELECT 
    p.perfume_id,
    p.description,
    p.image_url,
    p.created_at,
      (
    SELECT JSON_AGG(JSON_BUILD_OBJECT(
      'pp_id', sub.pp_id,
      'pp_price', sub.pp_price,
      'pp_count', sub.pp_count
    ))
    FROM (
      SELECT DISTINCT
        pp.perfume_price_id AS pp_id,
        pp.price AS pp_price,
        i.count AS pp_count
      FROM perfume_price pp
      LEFT JOIN inventory i USING (perfume_price_id)
      WHERE pp.perfume_id = p.perfume_id
      GROUP BY pp.perfume_id,pp_id,pp.price,i.count
    ) sub
  ) AS perfume_prices,
    REPLACE(p.perfume_name, '''''', '''') as perfume_name,
    AVG(price) AS avg_price,
    ARRAY_AGG(DISTINCT perfume_price_id) as perfume_price_ids,
    SUM(count) as total_count,
    pb.brand_id,
    brand_name,
    ARRAY_AGG(DISTINCT category_id) AS category
    FROM perfumes as p
    LEFT JOIN perfume_brand as pb USING (perfume_id)
    LEFT JOIN brands USING (brand_id)
    LEFT JOIN perfume_category USING (perfume_id)
    LEFT JOIN categories USING (category_id)
    LEFT JOIN perfume_price USING (perfume_id)
    LEFT JOIN inventory USING (perfume_price_id)
    WHERE brand_name ILIKE $1
    GROUP BY p.perfume_id,pb.brand_id,brand_name,perfume_price_id
    ORDER BY perfume_name;`,
    [`%${brand}%`]
  );
  
  console.log("in getPerfumesByBrand: ", rows);
  return rows;
}

async function getPerfumeByName(name) {
  console.log("in getPerfumeByName: ", name); 
  const { rows } = await pool.query("SELECT perfume_id FROM perfumes WHERE perfume_name=$1", [name]);
  console.log("in getPerfumeByName: ", rows);
  return rows.length > 0 ? rows[0] : {};
}
/**
 * matches any perfume with a name that contains this name provided
 * @param {*} name 
 * @returns 
 */
async function getPerfumesByName(name) {
  console.log("in getPerfumesByName: ", name);
  const { rows } = await pool.query(
    `SELECT 
    p.perfume_id,
    p.description,
    p.image_url,
    p.created_at,
      (
    SELECT JSON_AGG(JSON_BUILD_OBJECT(
      'pp_id', sub.pp_id,
      'pp_price', sub.pp_price,
      'pp_count', sub.pp_count
    ))
    FROM (
      SELECT DISTINCT
        pp.perfume_price_id AS pp_id,
        pp.price AS pp_price,
        i.count AS pp_count
      FROM perfume_price pp
      LEFT JOIN inventory i USING (perfume_price_id)
      WHERE pp.perfume_id = p.perfume_id
      GROUP BY pp.perfume_id,pp_id,pp.price,i.count
    ) sub
  ) AS perfume_prices,
    REPLACE(p.perfume_name, '''''', '''') as perfume_name,
    AVG(price) AS avg_price,
    ARRAY_AGG(DISTINCT perfume_price_id) as perfume_price_ids,
    SUM(count) as total_count,
    pb.brand_id,
    brand_name,
    ARRAY_AGG(DISTINCT category_id) AS category
    FROM perfumes AS p
    LEFT JOIN perfume_brand as pb USING (perfume_id)
    LEFT JOIN brands USING (brand_id)
    LEFT JOIN perfume_category USING (perfume_id)
    LEFT JOIN categories USING (category_id)
    LEFT JOIN perfume_price USING (perfume_id)
    LEFT JOIN inventory USING (perfume_price_id)
    WHERE perfume_name ILIKE $1
    GROUP BY p.perfume_id,pb.brand_id,brand_name
    ORDER BY perfume_name;`,
    [`%${name}%`]
  );
  
  console.log("in getPerfumesByName: ", rows);
  return rows;
}

/**
 * matches any perfume whose description contains the word(s) provided
 * @param {*} word 
 * @returns 
 */
async function getPerfumesByDesc(word) {
  console.log("in getPerfumeByDesc: ", word);
  const { rows } = await pool.query(
    `SELECT
    p.perfume_id,
    p.description,
    p.image_url,
    p.created_at,
      (
    SELECT JSON_AGG(JSON_BUILD_OBJECT(
      'pp_id', sub.pp_id,
      'pp_price', sub.pp_price,
      'pp_count', sub.pp_count
    ))
    FROM (
      SELECT DISTINCT
        pp.perfume_price_id AS pp_id,
        pp.price AS pp_price,
        i.count AS pp_count
      FROM perfume_price pp
      LEFT JOIN inventory i USING (perfume_price_id)
      WHERE pp.perfume_id = p.perfume_id
      GROUP BY pp.perfume_id,pp_id,pp.price,i.count
    ) sub
  ) AS perfume_prices,
    REPLACE(p.perfume_name, '''''', '''') as perfume_name,
    AVG(price) AS avg_price,
    ARRAY_AGG(DISTINCT perfume_price_id) as perfume_price_ids,
    SUM(count) as total_count,
    pb.brand_id,
    brand_name,
    ARRAY_AGG(DISTINCT category_id) AS category FROM perfumes AS p
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
  const { rows } = await pool.query("SELECT COUNT(*) AS count FROM perfume_brand;");
  console.log("in countAllItems: ", rows);
  return rows[0].count;
}

async function getBrandCount() {
  console.log("in getBrandCount");
  const { rows } = await pool.query(
    "SELECT COUNT(brand_id) AS count FROM brands;");
  console.log("in getBrandCount: ", rows);
  return rows[0].count;
}

async function getCategoryCount() {
  console.log("in getCategoryCount");
  const { rows } = await pool.query(
    "SELECT COUNT(category_id) AS count FROM categories;"
  );
  console.log("in getCategoryCount: ", rows);
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
async function getAllCategoryTypeDetails() {
  console.log("in getAllCategoryTypeDetails ");
  const query = `
    SELECT 
      c.category_id, 
      type, 
      category_name, 
      COUNT(perfume_id) AS perfume_count
    FROM 
      categories AS c
    LEFT JOIN 
      perfume_category AS p USING (category_id)
    GROUP BY 
      type, c.category_name, c.category_id
    ORDER BY 
      type
    LIMIT 
      $2 OFFSET $1;
  `;
  
  const { rows } = await pool.query(query, [
    viewedRows,
    LIMIT_SETTING
  ]);
  
  
  return {
    rows,
    viewedRows: rows.length + viewedRows,
  };
}

async function getCategoryDetailsById(category_id, viewedRows = 0) {
  console.log("in getCategoryDetailsById:", category_id);
  
  const query = `
    SELECT 
      c.category_id, 
      type, 
      category_name, 
      COUNT(perfume_id) AS perfume_count
    FROM 
      categories AS c
    LEFT JOIN 
      perfume_category AS p USING (category_id)
    WHERE
      c.category_id = $3
    GROUP BY 
      type, c.category_name, c.category_id
    ORDER BY 
      type
    LIMIT 
      $2 OFFSET $1;
  `;
  
  const { rows } = await pool.query(query, [viewedRows, LIMIT_SETTING, category_id ]);
  
  console.log("in getCategoryDetailsById:", rows);
  
  return {
    rows: rows.length > 0 ? rows[0] : {},
    viewedRows: rows.length + viewedRows,
  };
}

async function getAllCategories(viewedRows = 0) {
  console.log("in getAllCategories:", viewedRows);
  
  const query = `
    SELECT 
      c.category_id, 
      c.type, 
      category_name, 
      COUNT(perfume_id) AS pcountByCatId,
      (SELECT (COUNT(*)) FROM perfume_category pc INNER JOIN categories cat USING (category_id) GROUP BY type HAVING cat.type = c.type ) AS pcountByCatType
    FROM 
      categories AS c
    LEFT JOIN 
      perfume_category AS p USING (category_id)
    GROUP BY 
      type, c.category_name, c.category_id
    ORDER BY 
      c.type
    LIMIT 
      $2 OFFSET $1;
  `;
  
  const { rows } = await pool.query(query, [viewedRows, LIMIT_SETTING]);
  
  console.log("in getAllCategories:", rows);
  
  return {
    rows,
    viewedRows: rows.length + viewedRows,
  };
}

async function getAllItems(viewedRows=0) {
  console.log("in getAllItems: ", viewedRows);
  const { rows } = await pool.query(
    `
    SELECT perfume_id,image_url,REPLACE(perfume_name, '''''', '''') as perfume_name,brand_name,description,JSON_AGG(JSON_BUILD_OBJECT('pp_id',perfume_price_id,'price',price,'count',count)) as price_id_count
    FROM (
SELECT perfume_id,image_url,perfume_name,brand_name,description,price,perfume_price_id,count
      FROM perfumes AS p
      LEFT JOIN perfume_price USING (perfume_id)
      LEFT JOIN inventory USING (perfume_price_id)
      LEFT JOIN perfume_brand USING (perfume_id)
      LEFT JOIN brands USING (brand_id)
      ORDER BY perfume_id) as subquery
GROUP BY perfume_id,perfume_name,brand_name,image_url,description
    LIMIT ($2) OFFSET $1;
    `,
    [viewedRows, LIMIT_SETTING]
  );
  console.log("in getAllItems: ", rows.length);
  return { rows, viewedRows: rows.length + viewedRows };
}
async function getPerfumeIdByPerfumePriceId(perfume_price_id) {
  console.log("in getPerfumeIdByPerfumePriceId: ", perfume_price_id);
  const { rows } = await pool.query(
    `SELECT perfume_id
    FROM perfume_price
    INNER JOIN perfumes USING (perfume_id)
    WHERE perfume_price_id=$1;`,
    [perfume_price_id]
  );
  
  console.log("in getPerfumeByPerfumePriceId: ", rows);
  return rows[0];
}

async function getPerfumeDetailsById(id) {
  console.log("in getPerfumeDetailsById: ", id);
  const { rows } = await pool.query(
    `SELECT 
  p.perfume_id,
  image_url,
  description,
  created_at,
  (
    SELECT JSON_AGG(JSON_BUILD_OBJECT(
      'pp_id', sub.pp_id,
      'pp_price', sub.pp_price,
      'pp_count', sub.pp_count
    ))
    FROM (
      SELECT DISTINCT
        pp.perfume_price_id AS pp_id,
        pp.price AS pp_price,
        i.count AS pp_count
      FROM perfume_price pp
      LEFT JOIN inventory i USING (perfume_price_id)
      WHERE pp.perfume_id = p.perfume_id
    ) sub
  ) AS perfume_prices,
  REPLACE(perfume_name, '''''', '''') AS perfume_name,
  AVG(price) AS avg_price,
  ARRAY_AGG(DISTINCT perfume_price_id) AS perfume_price_ids,
  SUM(count) AS total_count,
  brand_id,
  brand_name,
  ARRAY_AGG(DISTINCT category_id) AS category
FROM perfumes AS p
LEFT JOIN perfume_price USING (perfume_id)
LEFT JOIN inventory USING (perfume_price_id)
LEFT JOIN perfume_brand USING (perfume_id)
LEFT JOIN brands USING (brand_id)
LEFT JOIN perfume_category USING (perfume_id)
LEFT JOIN categories USING (category_id)
WHERE p.perfume_id = $1
GROUP BY 
  p.perfume_id,
  image_url,
  description,
  perfume_name,
  brand_id,
  brand_name;
`,
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

async function getBrandById(id) {
  console.log("in getBrandById: ", id);
  
  const { rows } = await pool.query(
    "SELECT brand_name FROM brands WHERE brand_id=$1;",
    [id]
  );
  
  console.log("in getBrandById: ", rows);
  return rows.length > 0 ? rows[0] : {};
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

async function updateBrand(id,name) {
  console.log("in updateBrand");
  if (name) {
    
    await pool.query("UPDATE brands SET brand_name=$1 WHERE brand_id=$2", [
      name,
      id,
    ]);
  } else {
    const message = `The brand name cannot be blank or null: ${name}`;
    throw new Error(message);
  }
  
  console.log("in updateBrand");
}

async function updateCategory(id, type, name) {
  console.log("in updateCategory");
  if (id && name && type) {
    await pool.query("UPDATE categories SET type=$1, category_name=$2 WHERE category_id=$3", [
      type,
      name,
      id,
    ]);
  } else {
    const message = `The category name and category type cannot be blank or null.`;
    throw new Error(message);
  }

  console.log("in updateCategory");
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
async function addBrand(name) {
  
  if (name) {
    const id = await pool.query("INSERT INTO brands (brand_name) VALUES ($1)", [name]);
  } else {
    const message = `The brand name cannot be blank or null: ${name}`;
    throw new Error(message);
  }
}

/**
 * 
  with tt (pcount) as 
  (select count(perfume_id),perfume_id from perfume_category INNER JOIN perfumes using (perfume_id) group by perfume_id order by perfume_id) 
  select perfume_id from tt left join perfume_category using (perfume_id) where tt.pcount=1 and category_id=$1;
 */
async function deleteBrand(id) {
  if (id) {
    await pool.query("DELETE FROM perfumes where perfume_Id in (select perfume_id from perfumes INNER JOIN perfume_brand USING (perfume_id) WHERE brand_id=$1);", [id])
    await pool.query("DELETE FROM perfume_brand WHERE brand_id=$1", [id]);
    await pool.query("DELETE FROM brands        WHERE brand_id=$1", [id]);
  } else {
    const message = `The brand id cannot be blank or null: ${id}`;
    throw new Error(message);
  }
}

async function deleteCategory(id) {
  if (id) {
    await pool.query(
    `DELETE FROM perfumes WHERE perfume_id IN 
      (WITH tt(pcount) AS 
  (SELECT count(perfume_id),perfume_id FROM perfume_category INNER JOIN perfumes USING (perfume_id) GROUP BY perfume_id ORDER BY perfume_id) 
  SELECT perfume_id FROM tt LEFT JOIN perfume_category USING (perfume_id) WHERE tt.pcount=1 AND category_id=$1);`,
    [id]
  );
    await pool.query("DELETE FROM perfume_category WHERE category_id=$1", [id]);
    await pool.query("DELETE FROM categories        WHERE category_id=$1", [id]);
  } else {
    const message = `The category id cannot be blank or null: ${id}`;
    throw new Error(message);
  }
}
async function addPerfume(details) {
  console.log("in addPerfume: ", details);
  if (details) {
    if (!details.created_at) {
      details.created_at = new Date();
    }
    const perfume = await pool.query(
      "INSERT INTO perfumes (perfume_name, created_at, image_url, description) VALUES ($1,$2,$3,$4) RETURNING perfume_id;",
      [details.name, details.created_at, details.image_url, details.description]
    );

    const perfume_id = perfume.rows[0].perfume_id;
    
    console.log("in addPerfume: ", perfume_id);
    await pool.query("INSERT INTO perfume_brand (perfume_id, brand_id) VALUES ($1,$2);", [perfume_id, details.brands]);
    let catquery = "INSERT INTO perfume_category (perfume_id, category_id) VALUES ($1,$2)"; 
    if (!Array.isArray(details.category)) {
      details.category = [details.category];
    }
    let catparams = [perfume_id, +details.category[0]];
    for (let i = 1; i < details.category.length; i++) {
      catquery += ` (${i * 2 + 1},${i * 2 + 2})`;
      catparams.push(perfume_id);
      catparams.push(+details.category[i]);
    }
    console.log("catparams: ", catparams);
    console.log("catquery: ", catquery);
    await pool.query(catquery + ";", catparams);

    if (details.price) {
      const perfume_price = await pool.query("INSERT INTO perfume_price (perfume_id,price) VALUES ($1,$2) RETURNING perfume_price_id;", [perfume_id, Number(details.price)]);
      console.log("new perfume_price_id: ", perfume_price.rows[0].perfume_price_id);
      const count = Number(details.count);
      if (!isNaN(count)) {
        await pool.query("INSERT INTO inventory (perfume_price_id,count) VALUES ($1,$2)", [perfume_price.rows[0].perfume_price_id, Number(details.count)]);
      }
    }
    return perfume_id;
  } else {
    const message = `One of the values for the new perfume needs correcting: ${details}`;
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
  addBrand,
  addCategory,
  addPerfume,
  addPerfumeCategory,
  countAllItems,
  deleteBrand,
  deleteCategory,
  getAllBrands,
  getAllCategories,
  getAllCategoryTypeDetails,
  getAllItems,
  getBrandById,
  getBrandByName,
  getBrandCount,
  getCategoryCount,
  getCategory,
  getCategoryDetailsById,
  getPerfumeCategories,
  getPerfumeDetailsById,
  getPerfumeIdByPerfumePriceId,
  getPerfumePriceId,
  getPerfumesByBrand,
  getPerfumeByName,
  getPerfumesByCategoryId,
  getPerfumesByDesc,
  getPerfumesByName,
  setPerfumeBrand,
  setPerfumeCategory,
  setPerfumeInventory,
  setPerfumePrice,
  updateBrand,
  updateCategory,
};
//before running this code, we need to run createTables.js

const { name } = require("ejs");
const {
  getPerfumeByName,
  setPerfumeBrand,
  setPerfumeCategory,
  setPerfumePrice,
  setPerfumeInventory,
  addCategory,
  addPerfumeCategory,
} = require("./queries.js");
const fs = require("fs");
const path = require("path");

const CLEAR_OLD_DATA_SQL = `
TRUNCATE TABLE inventory CASCADE;
TRUNCATE TABLE perfume_category CASCADE;
TRUNCATE TABLE perfume_price CASCADE;
TRUNCATE TABLE perfume_brand CASCADE;
TRUNCATE TABLE perfumes CASCADE;
TRUNCATE TABLE brands CASCADE;
TRUNCATE TABLE categories CASCADE;
`;
/**
# populating local db
node db/populatedb.js <local-db-url>

# populating production db
# run it from your machine once after deployment of your app & db
node db/populatedb.js <production-db-url>
**/
async function addPerfumeData() {
  const dataFilePath = path.join(__dirname, "seed-data.json");
  const jsonData = fs.readFileSync(dataFilePath, "utf8");

  let categoryValuesSQL = `
    ('unisex', 'gender'),
    ('women', 'gender'),
    ('men', 'gender')
  `;

  const perfumeData = JSON.parse(jsonData);
  const allBrands = new Set();
  let allPerfumesSQL = "";
  for (let i = 0; i < perfumeData.length; i++) {
    //console.log(perfumeData[i].price);
    allBrands.add(perfumeData[i].brand_name);
    allPerfumesSQL += `('${perfumeData[i].description}', '${
      perfumeData[i].image_url
    }', 'NOW()', '${perfumeData[i].perfume_name.replace(/'/g, "''")}')`;
    if (i < perfumeData.length - 1) {
      allPerfumesSQL += ",";
    }
  }

  let brandValuesSQL = "";
  allBrands.values().forEach((el, inx) => {
    brandValuesSQL += `('${el}')`;
    if (inx < allBrands.size - 1) {
      brandValuesSQL += ",";
    }
  });

  const INITIAL_SETUP_SQL = `
    INSERT INTO brands (brand_name) VALUES ${brandValuesSQL};
    INSERT INTO categories (category_name, type) VALUES ${categoryValuesSQL};
    INSERT INTO perfumes (description, image_url, created_at, perfume_name) VALUES ${allPerfumesSQL};

  `;

  try {
    await pool.query(CLEAR_OLD_DATA_SQL);
    await pool.query(INITIAL_SETUP_SQL);
  } catch (err) {
    console.error(err);
  }
  for (let i = 0; i < perfumeData.length; i++) {
    const perfumeRow = await getPerfumeByName(perfumeData[i].perfume_name);
    await setPerfumeBrand(perfumeRow.perfume_id, perfumeData[i].brand_name);
    await setPerfumeCategory(
      perfumeRow.perfume_id,
      perfumeData[i].category_name,
      perfumeData[i].category_type
    );
    await setPerfumePrice(
      perfumeRow.perfume_id,
      Number(perfumeData[i].price > 0) ? perfumeData[i].price : 0.01
    );
    await setPerfumeInventory(
      perfumeRow.perfume_id,
      Math.floor(Math.random() * 3)
    );
  }

  const hautePerfumeRow = await getPerfumeByName("%oud & musc%"); //get one perfume to mark as 'haute' category
  const category_id = await addCategory("couture", "haute");
  console.log(category_id);
  await addPerfumeCategory(hautePerfumeRow.perfume_id, category_id);
  console.log("brand, category and perfumes tables seeded");
}

addPerfumeData();

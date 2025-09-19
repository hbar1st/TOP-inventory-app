//const { argv } = require("node:process");
const { getPerfumeByName, setPerfumeBrand } = require("./queries.js");
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

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
    //console.log(perfumeData[i]);
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
    const perfume_row = await getPerfumeByName(perfumeData[i].perfume_name);
    await setPerfumeBrand(perfume_row.perfume_id, perfumeData[i].brand_name);
    await setPerfumeCategory(perfume_row.perfume_id, perfumeData[i].category_name, perfumeData[i].category_type);
  }
  console.log("brand, category and perfumes tables seeded");
}

addPerfumeData();

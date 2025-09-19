
const fs = require("node:fs");
const path = require("path");

function parseSeedData() {
  let seedPath = "./seed-files";
  let perfumeData = [];
  try {
    const filenames = fs.readdirSync(seedPath);
    console.log("Filenames in directory:"), filenames;
    for (let i = 0; i < filenames.length; i++) {
      
      let brandName = filenames[i]
      .split(".")[0]
      .replace(/([A-Z])/g, " $1")
      .trim();
      
      const rawData = fs.readFileSync(path.join(seedPath, filenames[i]));
      
      console.log("seeding from: ", filenames[i])
      const myData = JSON.parse(rawData);
      
      const data = myData.map((el) => {
        return {
          perfume_name: el.Name.replace(/'/g, "''"),
          brand_name: brandName.replace(/'/g, "''"),
          image_url: el["Image URL"],
          category_type: "gender",
          category_name: el.Gender,
          price: Number(el.Price),
          created_at: new Date(),
          description: (el.Longevity != "" && el.Longevity.split('%')[0] > 50 ? "Eau de parfum" : "Eau de toilette")
        };
      });
      perfumeData.push(...data);
      
    }
  } catch (err) {
    console.error(`Error reading or parsing JSON file:`, err);
  }
  
  return perfumeData;
}

const seedData = JSON.stringify(parseSeedData(), null, 2); // null for no replacer function, 2 for 2-space indentation
try {
  fs.writeFileSync("./db/seed-data.json", seedData);
  // file written successfully
} catch (err) {
  console.error(err);
}
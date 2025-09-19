// run this script once
// node db/populateDB.js
// OR OR OR OR
// node db/populateDB.js <role-name> <role-password> [<port>||5432]
// use arguments if you don't want to rely on environment variables
const { argv } = require("node:process");

const fs = require("fs");
const path = require("path");

// user environment variables if you are deployed on your own physical server
const { pool } = require("./pool");
/** 
* OLD CODE that uses argv
* 
if (argv.length < 4) {
console.log(
"Pass in the role-name and the role-password at a minimum in that order, you may also provide the port last."
);
return;
}
*/

const CLEAR_OLD_TABLES_SQL = `
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS perfume_category CASCADE;
DROP TABLE IF EXISTS perfume_price CASCADE;
DROP TABLE IF EXISTS perfume_brand CASCADE;
DROP TABLE IF EXISTS perfumes CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
`;


async function main() {
  console.log("creating tables...");

  const sqlFilePath = path.join(__dirname, "setupdb.sql");
  const sqlCode = fs.readFileSync(sqlFilePath, "utf8");

  /**
   * new way of using command line variables
   */

  try {
    await pool.query(CLEAR_OLD_TABLES_SQL);

    await pool.query(sqlCode);
  } catch (err) {
    console.error(err);
  } finally {
    console.log("done");
  }
}

main();

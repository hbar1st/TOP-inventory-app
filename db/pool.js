const { Pool } = require("pg");
require("dotenv").config();

const connectionString = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;

console.log("connection string: ", connectionString);

// Add logging to see what's happening
console.log("Environment check in db/init.ts:", {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL ? "EXISTS" : "MISSING",
  DATABASE_URL_length: process.env.DATABASE_URL?.length,
});

const dbConfig =
  process.env.NODE_ENV === "production"
    ? {
        // on Railway, these environment variables need to be shared from the database service into the nodejs app block
        // this is a manual process that must be done in the Railway dashboard (via their gui)
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        database: process.env.PGDATABASE,
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT,
      };

pool = new Pool(dbConfig);
const log = false;
    const originalQuery = pool.query;
pool.query = async function (...args) {
  if (log) { 
  console.log("The query args were: ", args)
}
      const result = await originalQuery.apply(this, args);
      return result;
    };
module.exports = {
  connectionString,
  pool,
};

// server/db.js

const dotenv = require("dotenv");
const knex = require("knex");
// import dotenv from "dotenv";
// import knex from "knex";

dotenv.config();

const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  },
  pool: { min: 0, max: 10 },
});

module.exports = db;
// export default db;

// // server/dbConnection.js
// import mysql from "mysql2/promise";
// import dotenv from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";

// // Resolve this file's directory
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Always load .env from the project root: /localis-prototype/.env
// dotenv.config({
//   path: path.join(__dirname, "..", ".env"),
// });

// const pool = mysql.createPool({
//   host: process.env.MYSQL_HOST || "localhost",
//   port: process.env.MYSQL_PORT || 3306,
//   user: process.env.MYSQL_USER || "root",
//   password: process.env.MYSQL_PASSWORD,
//   database: process.env.MYSQL_DB || "localis_data",
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

// export async function dbQuery(sql, params = []) {
//   try {
//     const [rows] = await pool.query(sql, params);
//     return rows;
//   } catch (err) {
//     console.error("❌ Database query error:", err.message);
//     throw err;
//   }
// }

// export default pool;


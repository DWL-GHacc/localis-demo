import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function testConnection() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "localhost",
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "DWLmysql706588!",
      database: process.env.MYSQL_DB || "localis_data"
    });

    const [rows] = await conn.query("SELECT NOW() AS server_time;");
    console.log("✅ Connected to MySQL successfully!");
    console.log("Server time:", rows[0].server_time);

    await conn.end();
  } catch (err) {
    console.error("Database connection failed:");
    console.error(err.message);
  }
}

testConnection();
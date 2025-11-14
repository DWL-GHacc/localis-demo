// server/queries/localisQueries.js
import { dbQuery } from "../dbConnection.js";

// Example: get all spend rows (limit to stop accidental giant dumps)
export async function getAllSpendData(limit = 100) {
  const sql = "SELECT * FROM spend_data LIMIT ?";
  const rows = await dbQuery(sql, [limit]);
  return rows; // JSON-ready
}

// Example: get spend data for a specific LGA
export async function getSpendByLGA(lgaName, limit = 100) {
  const sql = `
    SELECT *
    FROM spend_data
    WHERE lga_name = ?
    LIMIT ?
  `;
  const rows = await dbQuery(sql, [lgaName, limit]);
  return rows;
}

// Example: get historical occupancy & ADR
export async function getHistoricalOccupancyByLGA(lgaName) {
  const sql = `
    SELECT *
    FROM historical_occupancy
    WHERE lga_name = ?
    ORDER BY hist_date;
  `;
  const rows = await dbQuery(sql, [lgaName]);
  return rows;
}

// Example: get length of stay & booking window
export async function getLengthOfStayByLGA(lgaName) {
  const sql = `
    SELECT *
    FROM length_of_stay
    WHERE lga_name = ?
    ORDER BY date_length;
  `;
  const rows = await dbQuery(sql, [lgaName]);
  return rows;
}

// server/queries/localisQueries.js
import { dbQuery } from "../dbConnection.js";

/**
 * SPEND DATA
 */

// Get most recent spend rows (for quick testing)
export async function getRecentSpend(limit = 20) {
  const sql = `
    SELECT 
      id,
      spend,
      cards_seen,
      no_txns,
      spend_date,
      region,
      category
    FROM spend_data
    ORDER BY spend_date DESC, id DESC
    LIMIT ?
  `;
  return dbQuery(sql, [limit]);
}

// Get spend filtered by region and optional date range
export async function getSpendByRegionAndDate(
  region,
  startDate = null,
  endDate = null
) {
  let sql = `
    SELECT 
      id,
      spend,
      cards_seen,
      no_txns,
      spend_date,
      region,
      category
    FROM spend_data
    WHERE region = ?
  `;
  const params = [region];

  if (startDate) {
    sql += " AND spend_date >= ?";
    params.push(startDate);
  }
  if (endDate) {
    sql += " AND spend_date <= ?";
    params.push(endDate);
  }

  sql += " ORDER BY spend_date ASC, id ASC";

  return dbQuery(sql, params);
}

// Example aggregation: total spend per region per category
export async function getSpendSummaryByRegion() {
  const sql = `
    SELECT 
      region,
      category,
      SUM(spend) AS total_spend,
      SUM(cards_seen) AS total_cards_seen,
      SUM(no_txns) AS total_txns
    FROM spend_data
    GROUP BY region, category
    ORDER BY region, category;
  `;
  return dbQuery(sql);
}

/**
 * HISTORICAL OCCUPANCY DATA
 */

export async function getHistoricalByLGA(lgaName) {
  const sql = `
    SELECT 
      id,
      hist_date,
      lga_name,
      average_historical_occupancy,
      average_daily_rate
    FROM historical
    WHERE lga_name = ?
    ORDER BY hist_date ASC, id ASC;
  `;
  return dbQuery(sql, [lgaName]);
}

/**
 * LENGTH OF STAY DATA
 */

export async function getLengthDataByLGA(lgaName) {
  const sql = `
    SELECT 
      id,
      date_length,
      lga_name,
      average_length_of_stay,
      average_booking_window
    FROM length_data
    WHERE lga_name = ?
    ORDER BY date_length ASC, id ASC;
  `;
  return dbQuery(sql, [lgaName]);
}

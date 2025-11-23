// server/queries/localisQueries.js
// import knex from "../db.js";

const knex = require("../db");

/**
 * Get the most recent spend records ordered by spend_date DESC.
 * limit is the maximum number of rows to return.
 */
async function getRecentSpend(limit = 10) {
  const safeLimit = Number.isNaN(Number(limit)) ? 10 : Number(limit);

  const rows = await knex("spend_data")
    .select("id", "spend", "cards_seen", "no_txns", "spend_date", "region", "category")
    .orderBy("spend_date", "desc")
    .limit(safeLimit);

  return rows;
}

/**
 * Get spend data for a specific region, optionally filtered by date range.
 * start / end are 'YYYY-MM-DD' strings (or null / undefined).
 */
async function getSpendByRegionAndDate(region, start = null, end = null) {
  let query = knex("spend_data")
    .select("id", "spend", "cards_seen", "no_txns", "spend_date", "region", "category")
    .where("region", region);

  if (start && end) {
    query = query.whereBetween("spend_date", [start, end]);
  } else if (start) {
    query = query.where("spend_date", ">=", start);
  } else if (end) {
    query = query.where("spend_date", "<=", end);
  }

  const rows = await query.orderBy("spend_date", "asc");
  return rows;
}

/**
 * Summarise spend by region:
 *  - total_spend: SUM(spend)
 *  - total_cards_seen: SUM(cards_seen)
 *  - total_transactions: SUM(no_txns)
 *  - days: COUNT(id) (number of daily rows for that region)
 */
async function getSpendSummaryByRegion() {
  const rows = await knex("spend_data")
    .select("region")
    .sum({ total_spend: "spend" })
    .sum({ total_cards_seen: "cards_seen" })
    .sum({ total_transactions: "no_txns" })
    .count({ days: "id" })
    .groupBy("region")
    .orderBy("region");

  return rows;
}

/**
 * Historical occupancy and Average Daily Rate (ADR) by LGA, aggregated monthly.
 * Uses `historical` table:
 *  - hist_date (datetime)
 *  - lga_name (text)
 *  - average_historical_occupancy (double)
 *  - average_daily_rate (double)
 */
async function getHistoricalByLGA(lgaName) {
  const rows = await knex("historical")
    .select(
      "lga_name",
      knex.raw("DATE_FORMAT(hist_date, '%Y-%m') AS year_month"),
      knex.raw("AVG(average_historical_occupancy) AS avg_historical_occupancy"),
      knex.raw("AVG(average_daily_rate) AS avg_daily_rate")
    )
    .where("lga_name", lgaName)
    .groupBy("lga_name", "year_month")
    .orderBy("year_month");

  return rows;
}

/**
 * Length-of-stay and booking window data by LGA, aggregated monthly.
 * Uses `length_data` table:
 *  - date_length (datetime)
 *  - lga_name (text)
 *  - average_length_of_stay (double)
 *  - average_booking_window (double)
 */
async function getLengthDataByLGA(lgaName) {
  const rows = await knex("length_data")
    .select(
      "lga_name",
      knex.raw("DATE_FORMAT(date_length, '%Y-%m') AS year_month"),
      knex.raw("AVG(average_length_of_stay) AS avg_length_of_stay"),
      knex.raw("AVG(average_booking_window) AS avg_booking_window")
    )
    .where("lga_name", lgaName)
    .groupBy("lga_name", "year_month")
    .orderBy("year_month");

  return rows;
}


exports.getRecentSpend = getRecentSpend;
exports.getSpendByRegionAndDate = getSpendByRegionAndDate;
exports.getSpendSummaryByRegion = getSpendSummaryByRegion;
exports.getHistoricalByLGA = getHistoricalByLGA;
exports.getLengthDataByLGA = getLengthDataByLGA;  

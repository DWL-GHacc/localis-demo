import { monthNameToNumber } from "./dateHelpers";

const rankingOptions = ["Occupancy Rate", "Daily Rate", "Length of Stay", "Booking Window"]
/* ---------------------------------------------------
    OCCUPANCY RANKING
--------------------------------------------------- */
export function getMonthlyOccRanking(rows = [], year, monthName) {
  const month = monthNameToNumber(monthName);

  const filtered = rows.filter(
    (r) => r.year === Number(year) && r.month === month
  );

  return filtered
    .map((r) => ({
      lga: r.lga_name,
      value: (Number(r.avg_occupancy) * 100).toFixed(1) + "%",
      numeric: Number(r.avg_occupancy), // ソート用
    }))
    .sort((a, b) => b.numeric - a.numeric);
}

/* ---------------------------------------------------
    ADR RANKING
--------------------------------------------------- */
export function getMonthlyADRRaking(rows = [], year, monthName) {
  const month = monthNameToNumber(monthName);

  const filtered = rows.filter(
    (r) => r.year === Number(year) && r.month === month
  );

  return filtered
    .map((r) => ({
      lga: r.lga_name,
      value: `$${(Math.round(r.avg_adr * 10) / 10).toFixed(1)}`,
      numeric: Number(r.avg_adr),
    }))
    .sort((a, b) => b.numeric - a.numeric);
}

/* ---------------------------------------------------
    LENGTH OF STAY RANKING
--------------------------------------------------- */
export function getMonthlyLOSRanking(rows = [], year, monthName) {
  const month = monthNameToNumber(monthName);

  const filtered = rows.filter(
    (r) => r.year === Number(year) && r.month === month
  );

  return filtered
    .map((r) => ({
      lga: r.lga_name,
      value: `${(Math.round(r.avg_length_of_stay * 10) / 10).toFixed(1)} days`,
      numeric: Number(r.avg_length_of_stay),
    }))
    .sort((a, b) => b.numeric - a.numeric);
}

/* ---------------------------------------------------
    BOOKING WINDOW RANKING
--------------------------------------------------- */
export function getMonthlyBWRanking(rows = [], year, monthName) {
  const month = monthNameToNumber(monthName);

  const filtered = rows.filter(
    (r) => r.year === Number(year) && r.month === month
  );

  return filtered
    .map((r) => ({
      lga: r.lga_name,
      value: `${(Math.round(r.avg_booking_window * 10) / 10).toFixed(1)} days`,
      numeric: Number(r.avg_booking_window),
    }))
    .sort((a, b) => b.numeric - a.numeric);
}

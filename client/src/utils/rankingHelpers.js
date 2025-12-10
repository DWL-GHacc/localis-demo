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
};

/* ---------------------------------------------------
   Top 3 and Bottom 3 Extraction
--------------------------------------------------- */

export function getSeasonalTopBottom3(rows, year, valueKey) {
  if (!rows || rows.length === 0) return { top3: [], bottom3: [] };

  const filtered = rows.filter((r) => Number(r.year) === Number(year));

  
  const sorted = [...filtered].sort((a, b) => b[valueKey] - a[valueKey]);


  const top3 = sorted.slice(0, 3).map((item) => ({
    month: item.month,
    value: item[valueKey],
  }));

  const bottom3 = sorted.slice(-3).reverse().map((item) => ({
    month: item.month,
    value: item[valueKey],
  }));

  return {
    top3,
    bottom3,
  };
}

export const seasonalMetricMap = {
  "Occupancy Rate": {
    key: "avg_occupancy",
    label: "Occupancy (%)",
    formatter: (v) => (v * 100).toFixed(1) + "%",
  },
  "Daily Rate": {
    key: "avg_adr",
    label: "Daily Rate (AU$)",
    formatter: (v) => `$${Number(v).toFixed(2)}`,
  },
  "Length of Stay": {
    key: "avg_length_of_stay",
    label: "Length of Stay (days)",
    formatter: (v) => Number(v).toFixed(1),
  },
  "Booking Window": {
    key: "avg_booking_window",
    label: "Booking Window (days)",
    formatter: (v) => Number(v).toFixed(1),
  },
};


export function getYoY(rows, key) {
  if (!rows || rows.length === 0) return null;

  const currentYear = 2024;
  const previousYear = 2023;

  const current = rows.filter(r => r.year === currentYear);
  const previous = rows.filter(r => r.year === previousYear);

  return current
    .map(c => {
      const p = previous.find(r => r.month === c.month);
      if (!p) return null;

      const diff = c[key] - p[key];
      const pct = p[key] !== 0 ? diff / p[key] : null;

      return {
        month: c.month,
        current: c[key],
        previous: p[key],
        change: diff,
        percent: pct,
      };
    })
    .filter(Boolean);
};

export function getSeasonalityIndex(rows, year, key) {
  const filtered = rows.filter((r) => r.year === Number(year));
  if (filtered.length === 0) return [];

  const avg = filtered.reduce((sum, r) => sum + r[key], 0) / filtered.length;

  return filtered.map((item) => ({
    month: item.month,
    value: item[key] / avg,
  }));
}

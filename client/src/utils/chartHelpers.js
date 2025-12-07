// -----------------------------------------------------
//  Month Helpers
// -----------------------------------------------------
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function monthNumToName(num) {
  return monthNames[num - 1];
}

// -----------------------------------------------------
//  1) SINGLE LGA - YEARLY CHARTS
// -----------------------------------------------------

export function getSingleLGAAvgOcc(rows = [], year) {
  const numericYear = Number(year);

  const result = [["Month", "Average Occupancy Rate"]];
  rows.forEach((r) => {
    if (r.year === numericYear) {
      result.push([monthNumToName(Number(r.month)), Number(r.avg_occupancy)]);
    }
  });

  return result;
}

export function getSingleLGAADR(rows = [], year) {
  const numericYear = Number(year);

  const result = [["Month", "Average Daily Rate"]];
  rows.forEach((r) => {
    if (r.year === numericYear) {
      result.push([
        monthNumToName(Number(r.month)),
        Math.round(Number(r.avg_adr) * 100) / 100,
      ]);
    }
  });

  return result;
}

export function getSingleLGAAvgLOS(rows = [], year) {
  const numericYear = Number(year);

  const result = [["Month", "Average Length of Stay"]];
  rows.forEach((r) => {
    if (r.year === numericYear) {
      result.push([
        monthNumToName(Number(r.month)),
        Math.round(Number(r.avg_length_of_stay) * 10) / 10,
      ]);
    }
  });

  return result;
}

export function getSingleLGAAvgBW(rows = [], year) {
  const numericYear = Number(year);

  const result = [["Month", "Average Booking Window"]];
  rows.forEach((r) => {
    if (r.year === numericYear) {
      result.push([
        monthNumToName(Number(r.month)),
        Math.round(Number(r.avg_booking_window) * 10) / 10,
      ]);
    }
  });

  return result;
}

// -----------------------------------------------------
//  2) ALL YEARS – MULTI-YEAR CHARTS (stacked by year)
// -----------------------------------------------------

export function getAllYearsAvgOcc(rows = []) {
  const cleanRows = rows.map((r) => ({
    year: Number(r.year),
    month: Number(r.month),
    value: Number(r.avg_occupancy),
  }));

  const uniqueYears = [...new Set(rows.map((r) => r.year))].sort();

  const result = [["Month", ...uniqueYears.map((y) => String(y))]];
  for (let m = 1; m <= 12; m++) {
    const row = [monthNumToName(m)];

    uniqueYears.forEach((year) => {
      const found = cleanRows.find((r) => r.year === year && r.month === m);
      row.push(found ? found.value : null);
    });

    result.push(row);
  }

  return result;
}

export function getAllYearsADR(paramRows = []) {
  const source = Array.isArray(paramRows)
    ? paramRows
    : paramRows.data?.Data || [];

  const rows = source.map((r) => ({
    year: Number(r.year),
    month: Number(r.month),
    avg_adr: Number(r.avg_adr),
  }));

  const uniqueYears = [...new Set(rows.map((r) => r.year))].sort();

  const result = [["Month", ...uniqueYears.map((y) => String(y))]];

  for (let month = 1; month <= 12; month++) {
    const row = [monthNumToName(month)];

    uniqueYears.forEach((year) => {
      const found = rows.find((r) => r.year === year && r.month === month);
      row.push(found ? Math.round(found.avg_adr * 100) / 100 : null);
    });

    result.push(row);
  }

  return result;
}

export function getAllYearsLOS(rows = []) {
  const cleanRows = rows.map((r) => ({
    year: Number(r.year),
    month: Number(r.month),
    value: Math.round(Number(r.avg_length_of_stay) * 10) / 10,
  }));

  const uniqueYears = [...new Set(rows.map((r) => r.year))].sort();

  const result = [["Month", ...uniqueYears.map((y) => String(y))]];

  for (let m = 1; m <= 12; m++) {
    const row = [monthNumToName(m)];

    uniqueYears.forEach((year) => {
      const found = cleanRows.find((r) => r.year === year && r.month === m);
      row.push(found ? found.value : null);
    });

    result.push(row);
  }

  return result;
}

export function getAllYearsBW(rows = []) {
  const cleanRows = rows.map((r) => ({
    year: Number(r.year),
    month: Number(r.month),
    value: Math.round(Number(r.avg_booking_window) * 10) / 10,
  }));

  const uniqueYears = [...new Set(rows.map((r) => r.year))].sort();

  const result = [["Month", ...uniqueYears.map((y) => String(y))]];

  for (let m = 1; m <= 12; m++) {
    const row = [monthNumToName(m)];

    uniqueYears.forEach((year) => {
      const found = cleanRows.find((r) => r.year === year && r.month === m);
      row.push(found ? found.value : null);
    });

    result.push(row);
  }

  return result;
}

// -----------------------------------------------------
//  3) COMPARE TWO LGAs – (lga, lga2)
// -----------------------------------------------------
export function getCompareLGAsAvgOcc(rows1 = [], rows2 = [], year, lga, lga2) {
  const result = [["Month", lga, lga2]];
  const numericYear = Number(year);

  for (let m = 1; m <= 12; m++) {
    const r1 = rows1.find((r) => r.year === numericYear && r.month === m);
    const r2 = rows2.find((r) => r.year === numericYear && r.month === m);

    result.push([
      monthNumToName(m),
      r1 ? Number(r1.avg_occupancy) : null,
      r2 ? Number(r2.avg_occupancy) : null,
    ]);
  }

  return result;
}

export function getCompareLGAsADR(rows1 = [], rows2 = [], year, lga, lga2) {
  const result = [["Month", lga, lga2]];
  const numericYear = Number(year);

  for (let m = 1; m <= 12; m++) {
    const r1 = rows1.find((r) => r.year === numericYear && r.month === m);
    const r2 = rows2.find((r) => r.year === numericYear && r.month === m);

    result.push([
      monthNumToName(m),
      r1 ? Math.round(Number(r1.avg_adr) * 100) / 100 : null,
      r2 ? Math.round(Number(r2.avg_adr) * 100) / 100 : null,
    ]);
  }

  return result;
}

export function getCompareLGAsLOS(rows1 = [], rows2 = [], year, lga, lga2) {
  const result = [["Month", lga, lga2]];
  const numericYear = Number(year);

  for (let m = 1; m <= 12; m++) {
    const r1 = rows1.find((r) => r.year === numericYear && r.month === m);
    const r2 = rows2.find((r) => r.year === numericYear && r.month === m);

    result.push([
      monthNumToName(m),
      r1 ? Math.round(Number(r1.avg_length_of_stay) * 10) / 10 : null,
      r2 ? Math.round(Number(r2.avg_length_of_stay) * 10) / 10 : null,
    ]);
  }

  return result;
}

export function getCompareLGAsBW(rows1 = [], rows2 = [], year, lga, lga2) {
  const result = [["Month", lga, lga2]];
  const numericYear = Number(year);

  for (let m = 1; m <= 12; m++) {
    const r1 = rows1.find((r) => r.year === numericYear && r.month === m);
    const r2 = rows2.find((r) => r.year === numericYear && r.month === m);

    result.push([
      monthNumToName(m),
      r1 ? Math.round(Number(r1.avg_booking_window) * 10) / 10 : null,
      r2 ? Math.round(Number(r2.avg_booking_window) * 10) / 10 : null,
    ]);
  }

  return result;
}

// -----------------------------------------------------
//  4) ALL LGAs – All Regions Comparison (for bar chart)
// -----------------------------------------------------
export function getAllLGAAvgOcc(rows = [], year) {
  const numericYear = Number(year);

  const filtered = rows.filter((r) => r.year === numericYear);
  const lgas = [...new Set(filtered.map((r) => r.lga_name))];
  const uniqueYears = [
    ...new Set(rows.map((r) => r.year).filter((y) => !Number.isNaN(y))),
  ].sort((a, b) => a - b);

  const result = [["Month", ...uniqueYears.map(String)]];

  for (let m = 1; m <= 12; m++) {
    const row = [monthNumToName(m)];

    lgas.forEach((lga) => {
      const found = filtered.find((r) => r.lga_name === lga && r.month === m);
      row.push(found ? Number(found.avg_occupancy) : null);
    });

    result.push(row);
  }

  return result;
}

export function getAllLGAAvgADR(rows = [], year) {
  const numericYear = Number(year);

  const filtered = rows.filter((r) => r.year === numericYear);
  const lgas = [...new Set(filtered.map((r) => r.lga_name))];

  const uniqueYears = [
    ...new Set(rows.map((r) => r.year).filter((y) => !Number.isNaN(y))),
  ].sort((a, b) => a - b);

  const result = [["Month", ...uniqueYears.map(String)]];

  for (let month = 1; month <= 12; month++) {
    const row = [month];

    lgas.forEach((lga) => {
      const found = filtered.find(
        (r) => r.lga_name === lga && r.month === month
      );
      row.push(found ? Math.round(Number(found.avg_adr) * 100) / 100 : null);
    });

    result.push(row);
  }

  return result;
}

export function getAllLGAAvgLOS(rows = [], year) {
  const numericYear = Number(year);

  const filtered = rows.filter((r) => r.year === numericYear);

  const lgas = [...new Set(filtered.map((r) => r.lga_name))];

  const uniqueYears = [
    ...new Set(rows.map((r) => r.year).filter((y) => !Number.isNaN(y))),
  ].sort((a, b) => a - b);

  const result = [["Month", ...uniqueYears.map(String)]];

  for (let month = 1; month <= 12; month++) {
    const row = [month];

    lgas.forEach((lga) => {
      const found = filtered.find(
        (r) => r.lga_name === lga && r.month === month
      );
      row.push(
        found ? Math.round(Number(found.avg_length_of_stay) * 10) / 10 : null
      );
    });

    result.push(row);
  }

  return result;
}

export function getAllLGAAvgBW(rows = [], year) {
  //   const rows = lengthMonthlyLOSBWPerLGA.data?.Data || [];
  const numericYear = Number(year);

  const filtered = rows.filter((r) => r.year === numericYear);

  const lgas = [...new Set(filtered.map((r) => r.lga_name))];

  const uniqueYears = [
    ...new Set(rows.map((r) => r.year).filter((y) => !Number.isNaN(y))),
  ].sort((a, b) => a - b);

  const result = [["Month", ...uniqueYears.map(String)]];
  console.log("result", result);

  for (let month = 1; month <= 12; month++) {
    const row = [month];

    lgas.forEach((lga) => {
      const found = filtered.find(
        (r) => r.lga_name === lga && r.month === month
      );
      row.push(
        found ? Math.round(Number(found.avg_booking_window) * 10) / 10 : null
      );
    });

    result.push(row);
  }

  return result;
}

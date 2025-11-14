// server/testQueries.js
import fs from "fs";
import {
  getAllSpendData,
  getSpendByLGA,
  getHistoricalOccupancyByLGA,
  getLengthOfStayByLGA,
} from "./queries/localisQueries.js";

async function run() {
  try {
    const lga = "YOUR_LGA_NAME_HERE"; // change to a real LGA

    const spend = await getSpendByLGA(lga);
    console.log("Spend data:", spend);

    const hist = await getHistoricalOccupancyByLGA(lga);
    console.log("Historical occupancy:", hist);

    const los = await getLengthOfStayByLGA(lga);
    console.log("Length of stay:", los);

    // If you want to write to a JSON file:
    const exportObj = { lga, spend, hist, los };
    fs.writeFileSync(
      "./server/export-lga-data.json",
      JSON.stringify(exportObj, null, 2)
    );
    console.log("✅ Exported to server/export-lga-data.json");
  } catch (err) {
    console.error("Test query failed:", err.message);
  }
}

run();

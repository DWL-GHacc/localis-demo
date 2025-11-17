// server/testQueries.js
import {
  getRecentSpend,
  getSpendByRegionAndDate,
  getSpendSummaryByRegion,
  getHistoricalByLGA,
  getLengthDataByLGA,
} from "./queries/localisQueries.js";

async function run() {
  try {
    const TEST_REGION = "Gold Coast";
    const TEST_LGA = "Gold Coast";

    console.log("=== Recent spend ===");
    const recentSpend = await getRecentSpend(5);
    console.log(JSON.stringify(recentSpend, null, 2));

    console.log("\n=== Spend by region and date range (Gold Coast, 2022) ===");
    const spendByRegion = await getSpendByRegionAndDate(
      TEST_REGION,
      "2022-01-01",
      "2022-12-31"
    );
    console.log(JSON.stringify(spendByRegion, null, 2));

    console.log("\n=== Spend summary by region/category ===");
    const spendSummary = await getSpendSummaryByRegion();
    console.log(JSON.stringify(spendSummary, null, 2));

    console.log(`\n=== Historical by LGA: ${TEST_LGA} ===`);
    const historical = await getHistoricalByLGA(TEST_LGA);
    console.log(JSON.stringify(historical, null, 2));

    console.log(`\n=== Length of stay by LGA: ${TEST_LGA} ===`);
    const lengthData = await getLengthDataByLGA(TEST_LGA);
    console.log(JSON.stringify(lengthData, null, 2));

  } catch (err) {
    console.error("❌ Test queries failed:");
    console.error(err);
  }
}

run();

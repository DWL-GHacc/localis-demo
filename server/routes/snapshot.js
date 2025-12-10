const express = require("express");
const router = express.Router();

function normaliseLgaName(region) {
    if (region === "Whitsundays") return "Whitsunday";
    return region;
}

router.get("/", async (req, res) => {
    const region = req.query.region;
    const year = req.query.year || "all";

    if(!region) {
        return res.json({Error: true, Message: "Region parameter required" });
    }
     
    const isAllYears = year === "all";
    const lgaName = normaliseLgaName(region);

    try {
       const db = req.db;
       
       //Spend summary

       let spendQuery = db("spend_data")
        .sum({ totalSpend: "spend" })
        .sum({ totalTransactions: "no_txns" })
        .sum({ totalCardsSeen : "cards_seen" })
        .where("region", region);

    if(!isAllYears) {
        spendQuery = spendQuery.whereRaw("YEAR(spend_date) = ?", [year]);
    }

    const spendRows = await spendQuery;
    const spend = spendRows[0];
     
     const spendSummary = {
        totalSpend: Number(spend.totalSpend || 0 ),
        totalTransactions: Number(spend.totalTransactions || 0 ),
        totalCardsSeen: Number(spend.totalCardsSeen || 0 ),
        avgSpendPerTransaction: spend.totalSpend && spend.totalTransactions ? Number(spend.totalSpend) / Number(spend.totalTransactions) : 0,
        spendPerCard: spend.totalSpend && spend.totalCardsSeen ? Number(spend.totalSpend) / Number(spend.totalCardsSeen) : 0
     };

     //Occupancy summary

     let occQuery = db("historical")
        .where("lga_name", lgaName);

    if(!isAllYears){
        occQuery = occQuery.whereRaw("YEAR(hist_date) = ?", [year])
    }

     const occRow = await occQuery
        .orderBy("hist_date", "desc")
        .first();

    const occupancySummary = occRow ? {
        latestDate: occRow.hist_date,
        occupancyRate: Number(occRow.average_historical_occupancy || 0),
        averageDailyRate: Number(occRow.average_daily_rate || 0),
    } : null;

    //LOS summary

    let losQuery = db("length_data")
        .avg({avgLengthOfStay: "average_length_of_stay" })
        .avg({ avgBookingWindow: "average_booking_window" })
        .where("lga_name", lgaName);

    if(!isAllYears) {
        losQuery = losQuery.whereRaw("YEAR(date_length) = ?", [year]);
    }

    const losRow = await losQuery.first();

    const losSummary = losRow ? {
        avgLengthOfStay: Number(losRow.avgLengthOfStay || 0),
        avgBookingWindow: Number(losRow.avgBookingWindow || 0)
    }: {
        avgLengthOfStay: 0,
        avgBookingWindow: 0,
    };

     return res.json({
        Error: false,
        Data: {
            region, 
            year,
            spend: spendSummary,
            occupancy: occupancySummary,
            lengthOfStay: losSummary,

        },
     });

    } catch (err) {
        console.error(err);
        return res.json({
            Error: true,
            Message:"Error Building Snapshot"
        });
    }
});

module.exports = router;

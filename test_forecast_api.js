const http = require('http');
const Database = require('better-sqlite3');
const path = require('path');

function requestApi(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Status: ${res.statusCode}, Body: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log("=== Forecast API Verification ===");
  
  // 1. Initial forecast generation
  console.log("1. Generating initial forecasts...");
  try {
    const res1 = await requestApi("http://localhost:3001/api/forecast");
    console.log("Initial Forecasts generated successfully.");
    console.log("Created count:", res1.new_forecasts.length);
    console.log("First forecast sample:", JSON.stringify(res1.new_forecasts[0], null, 2));
  } catch (err) {
    console.error("Error in initial forecast:", err.message);
    return;
  }

  // 2. DB manipulation to simulate time passing
  console.log("\n2. Manipulating target_time in DB to simulate 10 minutes passing...");
  const dbPath = path.join(process.cwd(), 'world_forecast.db');
  const db = new Database(dbPath);
  
  const pendingCount = db.prepare("SELECT COUNT(*) as count FROM predictions WHERE status = 'PENDING'").get().count;
  console.log(`Current PENDING predictions in DB: ${pendingCount}`);

  // Set target_time to 10 seconds in the past
  const pastTime = Math.floor(Date.now() / 1000) - 10;
  db.prepare("UPDATE predictions SET target_time = ? WHERE status = 'PENDING'").run(pastTime);
  console.log("Updated target_time for PENDING forecasts to past in database.");

  // 3. Trigger evaluation loop
  console.log("\n3. Invoking API again to trigger evaluation & self-improvement loop...");
  try {
    const res2 = await requestApi("http://localhost:3001/api/forecast?fast=true");
    console.log("Evaluation executed successfully.");
    console.log("Evaluated count:", res2.evaluated_count);
    console.log("Evaluated logs:", JSON.stringify(res2.evaluated_logs, null, 2));
    console.log("Updated Stats (Bias Offsets):", JSON.stringify(res2.stats, null, 2));
  } catch (err) {
    console.error("Error in evaluation forecast:", err.message);
  }
  
  db.close();
}

main();

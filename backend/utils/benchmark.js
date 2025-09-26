const fs = require('fs');
const { settleGroup } = require('./settleGroup'); // Adjust the path as needed

// --- CONFIGURATION ---
const MEMBER_COUNT = 10000;
const DATA_FILE = `cashflow_HV_${MEMBER_COUNT}_members.json`;
const ITERATIONS = 10; // Run the test multiple times for a stable average

// Load the large JSON data once
const rawData = fs.readFileSync(DATA_FILE, 'utf8');
const testMembers = JSON.parse(rawData);

console.log(`\nStarting benchmark for ${testMembers.length} members across ${ITERATIONS} iterations...`);

let totalTimeMs = 0;

for (let i = 0; i < ITERATIONS; i++) {
    // ------------------------------------------------------------------
    // 1. START the timer immediately before the core function call
    console.time(`Iteration ${i + 1}`);

    // 2. CALL the function we want to measure (the core settlement logic)
    const transactions = settleGroup(testMembers);

    // 3. END the timer immediately after the function returns
    console.timeEnd(`Iteration ${i + 1}`);
    // ------------------------------------------------------------------

    // Extract the time from console.timeEnd output (optional, but good for total average)
    // For simplicity, we'll just rely on the console output for the resume metric.
    
    if (i === 0) {
        console.log(`Transactions generated in first run: ${transactions.length}`);
    }
}

// NOTE: console.time/timeEnd prints the time automatically.
// The fastest run time is usually the most accurate indicator of pure algorithmic speed.
console.log('\nBenchmark complete. Review the times above.');

// Example of how you would run it: node benchmark.js
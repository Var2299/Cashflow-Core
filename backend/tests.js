const { settleGroup } = require('./utils/settleGroup');

// Test utilities
function assertEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    console.error(`❌ FAIL: ${message}`);
    console.error(`Expected: ${JSON.stringify(expected)}`);
    console.error(`Actual: ${JSON.stringify(actual)}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

function assertTransactionSum(transactions, expected, message) {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const rounded = Math.round(total * 100) / 100;
  if (Math.abs(rounded - expected) > 0.01) {
    console.error(`❌ FAIL: ${message}`);
    console.error(`Expected sum: ${expected}, Got: ${rounded}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

// Test 1: Simple three-person split
console.log('\n🧪 Test 1: Simple three-person split');
const members1 = [
  { id: 'Alice', net: 100.50 },
  { id: 'Bob', net: -50.25 },
  { id: 'Carol', net: -50.25 }
];
const result1 = settleGroup(members1);
console.log('Transactions:', result1);
assertEqual(result1.length, 2, 'Should have 2 transactions');
assertTransactionSum(result1, 100.50, 'Total settlement amount should be 100.50');

// Verify all debts settled
const aliceReceived = result1.filter(t => t.to === 'Alice').reduce((sum, t) => sum + t.amount, 0);
assertEqual(Math.round(aliceReceived * 100) / 100, 100.50, 'Alice should receive 100.50');

// Test 2: All zero balances
console.log('\n🧪 Test 2: All zero balances');
const members2 = [
  { id: 'A', net: 0 },
  { id: 'B', net: 0 },
  { id: 'C', net: 0 }
];
const result2 = settleGroup(members2);
console.log('Transactions:', result2);
assertEqual(result2, [], 'Should return empty array for zero balances');

// Test 3: Rounding edge case
console.log('\n🧪 Test 3: Rounding edge case with fractional cents');
const members3 = [
  { id: 'X', net: 33.333 },  // Will be rounded to 33.33 cents -> 3333 cents
  { id: 'Y', net: -16.666 }, // Will be rounded to -16.67 cents -> -1667 cents  
  { id: 'Z', net: -16.667 }  // Will be rounded to -16.67 cents -> -1667 cents
];
const result3 = settleGroup(members3);
console.log('Transactions:', result3);

// Check that we have reasonable number of transactions (should be 2)
if (result3.length > 3) {
  console.error(`❌ FAIL: Too many transactions for simple case: ${result3.length}`);
  process.exit(1);
}
console.log(`✅ PASS: Reasonable number of transactions: ${result3.length}`);

// Verify amounts are properly formatted (2 decimal places)
for (const transaction of result3) {
  const decimals = (transaction.amount.toString().split('.')[1] || '').length;
  if (decimals > 2) {
    console.error(`❌ FAIL: Amount has more than 2 decimal places: ${transaction.amount}`);
    process.exit(1);
  }
}
console.log('✅ PASS: All amounts properly formatted with ≤2 decimal places');

// Test 4: Edge case - single person
console.log('\n🧪 Test 4: Single person (edge case)');
const members4 = [{ id: 'Solo', net: 100 }];
const result4 = settleGroup(members4);
assertEqual(result4, [], 'Single person should result in no transactions');

// Test 5: Empty array
console.log('\n🧪 Test 5: Empty members array');
const result5 = settleGroup([]);
assertEqual(result5, [], 'Empty array should return empty transactions');

console.log('\n🎉 All tests passed!');
console.log('\n📊 Algorithm Complexity Analysis:');
console.log('- Time: O(k log k) where k = number of non-zero balances');
console.log('- Space: O(k) for heap storage');
console.log('- Greedy approach minimizes number of transactions');
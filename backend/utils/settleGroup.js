/**
 * settleGroup.js
 * Greedy settlement: always match largest debtor with largest creditor.
 * Uses integer cents internally to avoid floating point issues.
 *
 * Time: O(k log k) where k = number of non-zero members
 * Space: O(k)
 */

class MaxHeap {
  constructor() {
    this.data = [];
  }

  size() {
    return this.data.length;
  }

  isEmpty() {
    return this.data.length === 0;
  }

  // comparator: larger amount first; if amounts equal, compare id for determinism
  _compare(a, b) {
    if (a.amount !== b.amount) return a.amount > b.amount;
    return a.id < b.id;
  }

  _swap(i, j) {
    const t = this.data[i];
    this.data[i] = this.data[j];
    this.data[j] = t;
  }

  push(node) {
    this.data.push(node);
    this._heapifyUp(this.data.length - 1);
  }

  pop() {
    if (this.data.length === 0) return null;
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = last;
      this._heapifyDown(0);
    }
    return top;
  }

  peek() {
    return this.data.length ? this.data[0] : null;
  }

  _heapifyUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this._compare(this.data[index], this.data[parent])) {
        this._swap(index, parent);
        index = parent;
      } else break;
    }
  }

  _heapifyDown(index) {
    const n = this.data.length;
    while (true) {
      let largest = index;
      const l = 2 * index + 1;
      const r = 2 * index + 2;
      if (l < n && this._compare(this.data[l], this.data[largest])) largest = l;
      if (r < n && this._compare(this.data[r], this.data[largest])) largest = r;
      if (largest === index) break;
      this._swap(index, largest);
      index = largest;
    }
  }
}

function settleGroup(members) {
  if (!Array.isArray(members) || members.length === 0) return [];

  // Heaps for creditors and debtors (both max heaps)
  const creditors = new MaxHeap(); // those who should receive money (amount > 0)
  const debtors = new MaxHeap();   // those who owe money (we store positive owed amount)

  // Build heaps (convert to integer cents)
  for (const m of members) {
    // if net is not a number, skip
    const net = Number(m.net) || 0;
    const cents = Math.round(net * 100); // rupees -> paise
    if (cents > 0) creditors.push({ amount: cents, id: String(m.id) });
    else if (cents < 0) debtors.push({ amount: -cents, id: String(m.id) }); // store positive owed
  }

  const transactions = [];

  // Greedy loop: match largest creditor with largest debtor
  while (!creditors.isEmpty() && !debtors.isEmpty()) {
    const topCred = creditors.pop(); // largest amount to receive
    const topDebt = debtors.pop();  // largest amount owed

    const settleCents = Math.min(topCred.amount, topDebt.amount);

    // push transaction from debtor -> creditor
    const amountRupees = Math.round(settleCents) / 100; // convert back to rupees (2 decimals)
    transactions.push({
      from: topDebt.id,
      to: topCred.id,
      amount: Math.round(amountRupees * 100) / 100 // ensure 2 decimals
    });

    const credRem = topCred.amount - settleCents;
    const debtRem = topDebt.amount - settleCents;

    if (credRem > 0) creditors.push({ amount: credRem, id: topCred.id });
    if (debtRem > 0) debtors.push({ amount: debtRem, id: topDebt.id });
  }

  // transactions is list of {from, to, amount} with amount in rupees (2 decimals)
  return transactions;
}

module.exports = { settleGroup };

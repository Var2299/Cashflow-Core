import React, { useState } from 'react'
import { Copy, Check, ArrowRight, TrendingUp, Users, DollarSign } from 'lucide-react'

function ResultsDisplay({ results, loading }) {
  const [copied, setCopied] = useState(false)
  const [costPerTx, setCostPerTx] = useState(5.0) // default ₹5.00

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-64 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Calculating optimal settlements...</p>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Calculate</h3>
        <p className="text-gray-600">
          Enter member balances and click "Compute Settlements" to see optimal transactions
        </p>
      </div>
    )
  }

  // Helper: find members array from results (defensive)
  const membersArray =
    (Array.isArray(results.members) && results.members) ||
    (Array.isArray(results.inputMembers) && results.inputMembers) ||
    (Array.isArray(results.summary?.members) && results.summary.members) ||
    []

  const nonZeroMembers =
    membersArray.length > 0
      ? membersArray.filter(m => Number(m.net) && Number(m.net) !== 0).length
      : results.summary?.totalMembers || 0

  const optimalTxs = results?.transactions?.length || 0
  const baselineTxs = Math.max(0, nonZeroMembers - 1) // simple baseline: chain settlement

  const costOptimal = Number((optimalTxs * Number(costPerTx || 0)).toFixed(2))
  const costBaseline = Number((baselineTxs * Number(costPerTx || 0)).toFixed(2))
  const savings = Number((costBaseline - costOptimal).toFixed(2))
  const savingsPercent = costBaseline > 0 ? Math.round((savings / costBaseline) * 100) : 0

  const copyResults = async () => {
    const text = (results.transactions || [])
      .map(t => `${t.from} → ${t.to}: ₹${t.amount}`)
      .join('\n')

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  return (
     <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <Users className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{results.summary?.totalMembers || nonZeroMembers || 0}</p>
          <p className="text-xs text-gray-600">Members</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <ArrowRight className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{optimalTxs}</p>
          <p className="text-xs text-gray-600">Transactions</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <DollarSign className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">₹{results.summary?.totalAmount?.toFixed(2) || '0.00'}</p>
          <p className="text-xs text-gray-600">Total Flow</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Settlement Transactions</h3>
          {optimalTxs > 0 && (
            <button
              onClick={copyResults}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          )}
        </div>

        {results.transactions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">All Settled!</h4>
            <p className="text-gray-600">No transactions needed - everyone's balance is zero.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {results.transactions.map((transaction, index) => (
              <div
                key={index}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-red-700">
                        {transaction.from[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">{transaction.from}</span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-gray-400" />

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-emerald-700">
                        {transaction.to[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">{transaction.to}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 font-mono">
                    ₹{transaction.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {optimalTxs > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              Optimized for minimum transactions • All amounts in rupees with 2 decimal precision
            </p>
          </div>
        )}
      </div>

      {/* ===== full-width cost input & stacked cards (aligned to transactions width) ===== */}
      <div className="w-full mt-4">
        {/* Cost per transaction input (full width row) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <label className="text-sm text-gray-600">Cost per transaction (₹)</label>
              <input
                type="number"
                step="0.01"
                value={costPerTx}
                onChange={(e) => setCostPerTx(Number(e.target.value || 0))}
                className="w-28 px-2 py-1 border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="text-sm text-gray-500">
              Non-zero members: <span className="font-mono text-gray-700">{nonZeroMembers}</span>
            </div>
          </div>
        </div>

        {/* Stacked cards — both full width, one below another */}
        <div className="space-y-3 mt-4">
          {/* Cost Savings Card (full width) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-gray-700">Estimated Cost Savings</div>
                <div className="text-2xl font-bold text-emerald-700 mt-1">₹{savings.toFixed(2)}</div>
                <div className="text-sm text-gray-500 mt-2">
                  Baseline: {baselineTxs} tx • Optimal: {optimalTxs} tx • Saved {savingsPercent}%
                </div>
              </div>

              <div className="flex-shrink-0 text-right">
                <div className="text-xs text-gray-500">Baseline Cost</div>
                <div className="text-lg font-mono text-gray-900">₹{costBaseline.toFixed(2)}</div>

                <div className="mt-3 text-xs text-gray-500">Optimal Cost</div>
                <div className="text-lg font-mono text-gray-900">₹{costOptimal.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Detailed Comparison Card (full width) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="text-sm text-gray-500">Baseline (Sequential)</div>
                <div className="mt-2 text-lg font-semibold text-gray-900">{baselineTxs} Transactions</div>
                <div className="mt-1 text-sm text-gray-600">Total Cost:</div>
                <div className="text-xl font-mono font-bold text-gray-900">₹{costBaseline.toFixed(2)}</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="text-sm text-gray-500">Optimal (This App)</div>
                <div className="mt-2 text-lg font-semibold text-gray-900">{optimalTxs} Transactions</div>
                <div className="mt-1 text-sm text-gray-600">Total Cost:</div>
                <div className="text-xl font-mono font-bold text-emerald-700">₹{costOptimal.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


  )
}

export default ResultsDisplay

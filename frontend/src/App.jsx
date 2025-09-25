import React, { useState } from 'react'
import { Calculator, Info, Github } from 'lucide-react'
import MembersForm from './components/MembersForm'
import ResultsDisplay from './components/ResultsDisplay'

const SAMPLE_DATA = [
  { id: 'C', net: -50.0 },
  { id: 'I', net: 10.0 },
  { id: 'B', net: -100.0 },
  { id: 'G', net: 100.0 },
  { id: 'A', net: -500.0 },
  { id: 'F', net: 500.0 },
  { id: 'J', net: 10.0 },
  { id: 'H', net: 50.0 },
  { id: 'E', net: -10.0 },
  { id: 'D', net: -10.0 },
]

function App() {
  const [members, setMembers] = useState([{ id: '', net: 0 }])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSettlement = async () => {
    const validMembers = members.filter(m => String(m.id).trim() && Number(m.net) !== 0)

    if (validMembers.length < 2) {
      setError('Need at least 2 members with non-zero balances')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:3001/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: validMembers })
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || 'Settlement failed')
      }

      const data = await response.json()

      // Attach members to results so child components can use original balances if needed
      const summary = {
        totalMembers: validMembers.length,
        totalAmount: Math.abs(validMembers.reduce((s, m) => s + Number(m.net || 0), 0))
      }

      setResults({
        ...data,
        members: validMembers,
        summary
      })
    } catch (err) {
      setError(err.message || 'Connection failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  // UPDATED: accept sampleMembers argument from MembersForm's dropdown
  const loadSampleData = (sampleMembers) => {
    // If callers didn't pass a sample, fallback to the old SAMPLE_DATA
    const membersToLoad = Array.isArray(sampleMembers) && sampleMembers.length > 0 ? sampleMembers : SAMPLE_DATA

    setMembers(membersToLoad)
    setResults(null)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Calculator className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Cashflow Core</h1>
                <p className="text-sm text-gray-600">Optimal debt settlement calculator</p>
              </div>
            </div>
            <a
              href="https://github.com/Var2299"
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="View on GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Algorithm Info Card */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Algorithm Overview</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Uses a greedy heap-based approach with <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">O(k log k)</code> complexity
                to minimize the number of transactions needed to settle all debts.
                Converts amounts to integer cents for precise calculations, then matches largest creditors with largest debtors.
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <MembersForm
  members={members}
  setMembers={setMembers}
  onLoadSample={loadSampleData}
  onSubmit={handleSettlement}
  loading={loading}
  onClear={() => {
    setResults(null)       // remove right-side results/cards
    setError('')           // optional: clear any error
    // optionally reset other UI state if you want:
    // setLoading(false)
  }}
/>


            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div>
            <ResultsDisplay results={results} loading={loading} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>Built with React + Express • Optimized debt settlement algorithms</p>
        </footer>
      </div>
    </div>
  )
}

export default App

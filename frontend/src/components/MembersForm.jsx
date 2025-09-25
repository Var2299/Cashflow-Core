import React, { useState } from 'react'
import {
 Plus,
  Minus,
  Play,
  Users,
  AlertCircle,
  ChevronDown,
  Trash2,
  Code,
  Check,
  X
} from 'lucide-react'

const PRESET_SAMPLES = {
  'Default 10 (balanced)': [
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
  ],
  'Small Trip (4)': [
    { id: 'Alice', net: 200.0 },
    { id: 'Bob', net: -50.0 },
    { id: 'Carol', net: -100.0 },
    { id: 'Dave', net: -50.0 },
  ],
  'Edge cents (many small)': [
    { id: 'U1', net: 0.01 },
    { id: 'U2', net: -0.01 },
    { id: 'U3', net: 0.02 },
    { id: 'U4', net: -0.02 },
  ],
  'Mixed (8)': [
    { id: 'P', net: 150.0 },
    { id: 'Q', net: -70.0 },
    { id: 'R', net: -30.0 },
    { id: 'S', net: 40.0 },
    { id: 'T', net: -60.0 },
    { id: 'U', net: 20.0 },
    { id: 'V', net: 25.0 },
    { id: 'W', net: -75.0 },
  ],
}

function randomSample(count = 6) {
  const arr = []
  let total = 0
  for (let i = 0; i < count - 1; i++) {
    const val = Math.round((Math.random() * 200 - 100) * 100) / 100
    arr.push({ id: `R${i + 1}`, net: val })
    total += val
  }
  const last = Math.round((-total) * 100) / 100
  arr.push({ id: `R${count}`, net: last })
  return arr
}

function MembersForm({ members, setMembers, onLoadSample, onSubmit, loading, onClear }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [jsonOpen, setJsonOpen] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState('')

  const addMember = () => {
    setMembers([...members, { id: '', net: 0 }])
  }

  const removeMember = (index) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index))
    }
  }

  const updateMember = (index, field, value) => {
    const updated = [...members]
    updated[index] = { ...updated[index], [field]: value }
    setMembers(updated)
  }

  const totalNet = members.reduce((sum, member) => {
    const amount = parseFloat(member.net) || 0
    return sum + amount
  }, 0)

  const isBalanced = Math.abs(totalNet) < 0.01
  const validMembers = members.filter(m => String(m.id).trim() && Number(m.net) !== 0).length

  // load a named preset sample (or random)
  const handleLoadSample = (key) => {
    let sampleMembers = []
    if (key === 'RANDOM') sampleMembers = randomSample(8)
    else sampleMembers = PRESET_SAMPLES[key] ? PRESET_SAMPLES[key].map(m => ({ ...m })) : []

    if (sampleMembers.length) {
      setMembers(sampleMembers)
      try {
        if (typeof onLoadSample === 'function') onLoadSample(sampleMembers)
      } catch (err) {
        console.warn('onLoadSample threw or has different signature:', err)
      }
    }
    setMenuOpen(false)
  }

  // CLEAR: reset to single empty member row and tell parent to clear results if provided
  const handleClear = () => {
    setMembers([{ id: '', net: 0 }])
    setMenuOpen(false)
    setJsonOpen(false)
    setJsonText('')
    setJsonError('')
    try {
      if (typeof onClear === 'function') {
        onClear()
      }
    } catch (err) {
      console.warn('onClear threw:', err)
    }
  }

  // JSON paste handler: accepts either an array or object with members key
  const handleApplyJson = () => {
    setJsonError('')
    if (!jsonText || !jsonText.trim()) {
      setJsonError('Paste valid JSON containing an array of members or { "members": [...] }.')
      return
    }

    let parsed
    try {
      parsed = JSON.parse(jsonText)
    } catch (err) {
      setJsonError('Invalid JSON. Please fix syntax and try again.')
      return
    }

    let arr = []
    if (Array.isArray(parsed)) arr = parsed
    else if (parsed && Array.isArray(parsed.members)) arr = parsed.members
    else {
      setJsonError('JSON must be an array or an object with a "members" array.')
      return
    }

    // normalize entries to {id, net}
    const normalized = []
    for (const entry of arr) {
      if (!entry) continue
      const id = String(entry.id ?? entry.name ?? entry.label ?? '').trim()
      let net = Number(entry.net ?? entry.balance ?? entry.amount ?? 0)
      if (Number.isNaN(net)) {
        // try to parse currencies in strings like "₹50" or "$25"
        if (typeof entry === 'string') {
          const m = entry.match(/-?[\d,]*\.?\d+/)
          net = m ? Number(m[0].replace(/,/g, '')) : 0
        } else {
          net = 0
        }
      }
      if (!id) {
        setJsonError('Every member needs an "id" (name). One or more entries missing id.')
        return
      }
      // round to 2 decimals
      net = Math.round(net * 100) / 100
      normalized.push({ id, net })
    }

    if (normalized.length === 0) {
      setJsonError('No valid member entries found in JSON.')
      return
    }

    // apply to form
    setMembers(normalized)
    setJsonOpen(false)
    setJsonText('')
    setJsonError('')

    try {
      if (typeof onLoadSample === 'function') onLoadSample(normalized)
    } catch (err) {
      // ignore
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Users className="w-5 h-5 text-emerald-600" />
          <span>Group Members</span>
        </h2>

        {/* Load Sample dropdown + Paste JSON + Clear button */}
        <div className="relative flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="inline-flex items-center space-x-2 px-3 py-1 rounded text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <span>Load Sample</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-lg z-20">
                <div className="py-1">
                  {Object.keys(PRESET_SAMPLES).map((k) => (
                    <button
                      key={k}
                      onClick={() => handleLoadSample(k)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                    >
                      {k}
                    </button>
                  ))}

                  <div className="border-t border-gray-100 my-1" />

                  <button
                    onClick={() => handleLoadSample('RANDOM')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium text-emerald-600"
                  >
                    Generate Random Sample
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Paste JSON button */}
          <div className="relative">
            <button
              onClick={() => {
                setJsonOpen(prev => !prev)
                setMenuOpen(false)
                setJsonError('')
              }}
              className="inline-flex items-center space-x-2 px-3 py-1 rounded text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              title="Paste JSON to fill members"
            >
              <Code className="w-4 h-4" />
              <span>Paste JSON</span>
            </button>

            {jsonOpen && (
              <div className="absolute right-0 mt-2 w-[360px] bg-white border border-gray-200 rounded shadow-lg z-20 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-700">Paste members JSON</div>
                  <button
                    onClick={() => {
                      setJsonOpen(false)
                      setJsonText('')
                      setJsonError('')
                    }}
                    className="text-gray-400 hover:text-gray-600"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder='e.g. [{"id":"Alex","net":50},{"id":"Bob","net":-50}] or {"members":[...]}'
                  className="w-full h-28 p-2 border border-gray-200 rounded text-sm font-mono resize-none"
                />

                {jsonError && <div className="text-xs text-red-600 mt-2">{jsonError}</div>}

                <div className="mt-3 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => {
                      setJsonOpen(false)
                      setJsonText('')
                      setJsonError('')
                    }}
                    className="px-3 py-1 text-sm rounded border border-gray-200 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyJson}
                    className="px-3 py-1 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 flex items-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Apply JSON</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Clear button */}
          <button
            onClick={handleClear}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            title="Clear all members"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {members.map((member, index) => (
          <div key={index} className="flex items-center space-x-3 group">
            <input
              type="text"
              placeholder="Member ID"
              value={member.id}
              onChange={(e) => updateMember(index, 'id', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Net Amount"
              value={member.net || ''}
              onChange={(e) => updateMember(index, 'net', parseFloat(e.target.value) || 0)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-right transition-colors"
            />
            <button
              onClick={() => removeMember(index)}
              disabled={members.length === 1}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove member"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={addMember}
          className="flex items-center space-x-2 px-3 py-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>

        <div className={`text-sm font-mono ${isBalanced ? 'text-emerald-600' : 'text-amber-600'}`}>
          Total: ₹{totalNet.toFixed(2)}
        </div>
      </div>

      {!isBalanced && (
        <div className="mb-4 flex items-start space-x-2 text-amber-700 bg-amber-50 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Imbalanced totals</p>
            <p className="text-amber-600">Sum should be zero for accurate settlement</p>
          </div>
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={loading || validMembers < 2}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 group"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Play className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            <span>Compute Settlements</span>
          </>
        )}
      </button>

      <p className="mt-3 text-xs text-gray-600 text-center">
        Need at least 2 members with non-zero balances • Positive = owed money, Negative = owes money
      </p>
    </div>
  )
}

export default MembersForm

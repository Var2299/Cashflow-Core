const express = require('express');
const cors = require('cors');
const { settleGroup } = require('./utils/settleGroup');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Main settlement endpoint
app.post('/settle', (req, res) => {
  try {
    const { members } = req.body;
    
    // Input validation
    if (!members || !Array.isArray(members)) {
      return res.status(400).json({
        error: 'Invalid input: members array is required'
      });
    }

    if (members.length === 0) {
      return res.json({ transactions: [] });
    }

    // Validate each member
    for (const member of members) {
      if (!member.id || typeof member.net !== 'number') {
        return res.status(400).json({
          error: 'Invalid member format: each member must have id (string) and net (number)'
        });
      }
      if (!isFinite(member.net)) {
        return res.status(400).json({
          error: 'Invalid net amount: must be a finite number'
        });
      }
    }

    // Check for duplicate IDs
    const ids = members.map(m => m.id);
    if (new Set(ids).size !== ids.length) {
      return res.status(400).json({
        error: 'Duplicate member IDs found'
      });
    }

    // Calculate settlements
    const transactions = settleGroup(members);
    
    res.json({
      transactions,
      summary: {
        totalMembers: members.length,
        totalTransactions: transactions.length,
        totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0)
      }
    });

  } catch (error) {
    console.error('Settlement error:', error);
    res.status(500).json({
      error: 'Internal server error during settlement calculation'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Cashflow Core API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💰 Settlement endpoint: POST http://localhost:${PORT}/settle`);
});

module.exports = app;
# Cashflow Core

A minimal, production-ready debt settlement microservice with React demo UI. Uses optimized algorithms to calculate the minimum number of transactions needed to settle group expenses.

## 🚀 Features

- **Backend**: Express.js REST API with heap-optimized settlement algorithm
- **Frontend**: Clean React UI with Tailwind CSS styling
- **Algorithm**: O(k log k) greedy approach minimizes transaction count
- **Precision**: Integer cent calculations prevent rounding errors
- **Validation**: Comprehensive input validation and error handling

## 📁 Project Structure

```
cashflow-core/
├── backend/              # Node.js + Express API
│   ├── server.js        # Main server with /settle endpoint
│   ├── utils/           
│   │   └── settleGroup.js # Core settlement algorithm
│   ├── tests.js         # Unit tests
│   └── package.json     
├── frontend/            # React + Vite app
│   ├── src/
│   │   ├── App.jsx      # Main application component
│   │   └── components/  
│   │       ├── MembersForm.jsx    # Input form
│   │       └── ResultsDisplay.jsx # Results table
│   └── package.json
└── README.md
```

## 🛠 Quick Start

### Install Dependencies
```bash
# Install all dependencies (backend + frontend)
npm run install:all

# Or install separately
npm install --prefix backend
npm install --prefix frontend
```

### Run Development Servers
```bash
# Run both backend and frontend concurrently
npm run dev

# Or run separately
npm run dev:backend  # Starts on :3001
npm run dev:frontend # Starts on :3000
```

### Run Tests
```bash
npm test
```

## 🔧 API Usage

### Endpoint: `POST /settle`

**Request:**
```json
{
  "members": [
    { "id": "Alice", "net": 120.50 },
    { "id": "Bob", "net": -45.25 },
    { "id": "Carol", "net": -75.25 }
  ]
}
```

**Response:**
```json
{
  "transactions": [
    { "from": "Bob", "to": "Alice", "amount": 45.25 },
    { "from": "Carol", "to": "Alice", "amount": 75.25 }
  ],
  "summary": {
    "totalMembers": 3,
    "totalTransactions": 2,
    "totalAmount": 120.50
  }
}
```

### cURL Example
```bash
curl -X POST http://localhost:3001/settle \
  -H "Content-Type: application/json" \
  -d '{
    "members": [
      {"id": "Alice", "net": 100},
      {"id": "Bob", "net": -60},
      {"id": "Carol", "net": -40}
    ]
  }'
```

## 🧮 Algorithm Details

The settlement algorithm uses a **greedy heap-based approach**:

1. **Convert to cents**: Avoids floating-point precision issues
2. **Separate creditors/debtors**: Split into positive/negative balances  
3. **Heap optimization**: Max-heap for creditors, min-heap for debtors
4. **Greedy matching**: Always settle largest creditor with smallest debtor
5. **Minimize transactions**: Reduces complexity from O(n²) to O(k log k)

**Time Complexity**: O(k log k) where k = number of non-zero balances  
**Space Complexity**: O(k) for heap storage

## 🧪 Testing

Backend includes comprehensive tests:
- Simple three-person split
- All zero balances edge case  
- Rounding precision validation
- Single person handling
- Empty input validation

```bash
cd backend && npm test
```

## 🎯 Frontend Features

- **Interactive Form**: Add/remove members dynamically
- **Sample Data**: Quick demo with pre-filled realistic data
- **Real-time Validation**: Balance checking and error display
- **Results Display**: Clean transaction table with copy-to-clipboard
- **Responsive Design**: Works on mobile and desktop
- **Loading States**: Smooth UX during API calls

## 🔒 Input Validation

- Members must have unique IDs
- Net amounts must be finite numbers
- Minimum 2 members with non-zero balances
- Proper error messages for all edge cases

## 🚀 Production Deployment

### Backend
```bash
cd backend
npm start  # Runs on PORT env var or 3001
```

### Frontend  
```bash
cd frontend
npm run build   # Creates dist/ folder
npm run preview # Serve built files
```

## 📊 Performance

- **Optimized Algorithm**: Heap-based matching reduces transactions
- **Integer Arithmetic**: Prevents floating-point errors  
- **Minimal Dependencies**: Fast startup and small footprint
- **Efficient Frontend**: Optimized React components with minimal re-renders

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Run tests: `npm test`  
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ using Node.js, React, and optimal algorithms**
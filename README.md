# 💳 Smart Credit Card Advisor — India

A production-grade web application that helps Indian users select, optimize, upgrade, or cancel credit cards based on their actual spending behavior. Unlike comparison sites, this app acts as a **decision engine** providing personalized recommendations with clear yearly financial impact.

![Made for India](https://img.shields.io/badge/Made%20for-India-orange)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)

## 🎯 Problem Statement

Most Indians lose ₹5,000 - ₹15,000 annually on credit cards due to:

- **Wrong Reward Structure**: Using a travel card for grocery spending
- **Unused Lounge Benefits**: Paying for lounge access never utilized
- **High Annual Fees**: Premium cards that don't justify their cost
- **Overlapping Cards**: Multiple cards with redundant benefits

This application solves these problems with data-driven, personalized recommendations.

## ✨ Key Features

### 1. Personalized Card Recommendation
- Analyzes spending patterns across 5 categories
- Ranks cards by **Net Yearly Benefit** (rewards - fees)
- Explains recommendations in plain English

### 2. Net Yearly Benefit Calculator
For each card:
- Calculates yearly cashback/reward value
- Adds lounge access value based on usage
- Subtracts annual fee
- Shows clear **gain** or **loss**

### 3. Hidden Fee & Waste Detection
Warns when:
- Annual fee exceeds rewards earned
- Lounge access goes unused
- Card mismatches spending pattern

### 4. Existing Card Optimization
If you have cards:
- Best card for each spending category
- Overlapping benefit detection
- Keep / Close / Upgrade suggestions

### 5. Eligibility & Approval Probability
- Checks income and credit score requirements
- Shows approval chance: High / Medium / Low

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │  HomePage   │ │ WizardPage  │ │    ResultsPage      │   │
│  │  (Landing)  │ │ (4-Step)    │ │  (Recommendations)  │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ REST API
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Node.js + Express)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Controllers                        │  │
│  │  • cardController      • recommendationController     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                     Services                          │  │
│  │  • recommendationEngine   • feeDetectionService      │  │
│  │  • cardOptimizationService • eligibilityService       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB Database                        │
│  ┌──────────────┐ ┌──────────────┐ ┌───────────────────┐   │
│  │ CreditCards  │ │  UserInputs  │ │  Recommendations  │   │
│  │  (15 cards)  │ │   (history)  │ │     (results)     │   │
│  └──────────────┘ └──────────────┘ └───────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 📂 Project Structure

```
projectX/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── cardController.js     # Card CRUD operations
│   │   └── recommendationController.js
│   ├── data/
│   │   └── seedCards.js          # 15 Indian credit cards
│   ├── models/
│   │   ├── CreditCard.js         # Card schema
│   │   ├── UserInput.js          # User input schema
│   │   └── Recommendation.js     # Results schema
│   ├── routes/
│   │   ├── cardRoutes.js
│   │   └── recommendationRoutes.js
│   ├── services/
│   │   ├── recommendationEngine.js    # Core scoring logic
│   │   ├── feeDetectionService.js     # Warning detection
│   │   ├── cardOptimizationService.js # Existing card analysis
│   │   └── eligibilityService.js      # Approval probability
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Header, Footer
│   │   │   ├── wizard/           # Form steps
│   │   │   └── results/          # Result components
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── WizardPage.jsx
│   │   │   └── ResultsPage.jsx
│   │   ├── services/
│   │   │   └── api.js            # Axios API client
│   │   ├── utils/
│   │   │   └── formatters.js     # Currency formatting
│   │   ├── App.jsx
│   │   ├── index.css             # Design system
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

## 🧮 Scoring Logic

### Net Yearly Benefit Formula

```
NetBenefit = TotalRewardValue + LoungeValue - AnnualFee
```

Where:

**TotalRewardValue** (for cashback cards):
```
= Σ (MonthlySpend_category × RewardRate% × 12)
```

**TotalRewardValue** (for points cards):
```
= Σ (MonthlySpend_category / 100 × PointsPerRupee × PointValue × 12)
```

**LoungeValue**:
```
= min(EstimatedVisits, CardLoungeLimit) × ValuePerVisit
```

| Lounge Usage | Estimated Visits/Year |
|--------------|----------------------|
| Never        | 0                    |
| Sometimes    | 4                    |
| Frequent     | 12                   |

### Match Score (for ranking)

Beyond net benefit, cards are ranked by:
1. **Preference match**: +20% if card type matches user preference
2. **Category match**: +10% if card excels in user's top spending category
3. **Fee tolerance**: -50% if annual fee exceeds user's stated tolerance
4. **Travel bonus**: +15% for frequent travelers with lounge access cards

### Approval Probability

| Credit Score | Income vs Required | Probability |
|--------------|-------------------|-------------|
| Excellent    | Above             | High        |
| Good         | Above             | Medium-High |
| Fair         | Above             | Medium      |
| Any          | Below             | Low         |

## 🗃️ Database Schemas

### CreditCard

```javascript
{
  name: String,           // "HDFC Infinia"
  bank: String,           // "HDFC Bank"
  annualFee: Number,      // 10000
  rewardType: String,     // "cashback" | "points"
  rewards: {
    food: Number,         // Percentage or points/₹100
    fuel: Number,
    travel: Number,
    online: Number,
    offline: Number,
    default: Number
  },
  pointValue: Number,     // Value of 1 point in INR
  loungeAccess: {
    domestic: Number,
    international: Number
  },
  eligibility: {
    minMonthlyIncome: Number,
    minCreditScore: Number
  },
  benefits: [String],
  bestFor: String
}
```

### UserInput

```javascript
{
  spending: {
    food: Number,
    fuel: Number,
    travel: Number,
    online: Number,
    offline: Number
  },
  travelFrequency: String,    // "rare" | "occasional" | "frequent"
  loungeUsage: String,        // "never" | "sometimes" | "frequent"
  rewardPreference: String,   // "cashback" | "points"
  annualFeeTolerance: String, // "zero" | "low" | "high"
  monthlyIncome: Number,
  creditScore: String,
  existingCardIds: [ObjectId]
}
```

## 💳 Seeded Credit Cards (15)

| Card | Bank | Annual Fee | Best For |
|------|------|------------|----------|
| HDFC Infinia | HDFC | ₹10,000 | Premium travelers |
| HDFC Regalia | HDFC | ₹2,500 | Mid-premium travel |
| HDFC Millennia | HDFC | ₹1,000 | Online shoppers |
| SBI SimplyCLICK | SBI | ₹499 | Online shopping |
| SBI Prime | SBI | ₹2,999 | Dining |
| ICICI Amazon Pay | ICICI | ₹500 | Amazon shoppers |
| ICICI Sapphiro | ICICI | ₹3,500 | Lifestyle |
| Axis Flipkart | Axis | ₹500 | Flipkart shoppers |
| Axis Magnus | Axis | ₹10,000 | Ultra premium travel |
| Amex Platinum Travel | Amex | ₹3,500 | Travel rewards |
| HSBC Cashback | HSBC | ₹750 | Cashback lovers |
| IndusInd Legend | IndusInd | ₹0 | Golf enthusiasts |
| Yes First Preferred | Yes Bank | ₹1,499 | First-time premium |
| RBL ShopRite | RBL | ₹0 | Budget shoppers |
| Kotak 811 | Kotak | ₹0 | Zero fee seekers |

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd projectX
```

2. **Setup Backend**
```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI

# Seed the database
npm run seed

# Start the server
npm run dev
```

3. **Setup Frontend**
```bash
cd frontend
npm install

# Start the development server
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## 📡 API Endpoints

### Cards

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cards` | Get all cards (with filters) |
| GET | `/api/cards/:id` | Get card by ID |
| GET | `/api/cards/banks` | Get all bank names |
| GET | `/api/cards/fee/:tolerance` | Get cards by fee tolerance |

### Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/recommendations` | Generate recommendations |
| GET | `/api/recommendations/:id` | Get saved recommendation |
| POST | `/api/recommendations/calculate` | Quick single-card calculation |
| POST | `/api/recommendations/compare` | Compare multiple cards |

## 🎨 Design System

The frontend uses a custom dark theme design system with:

- **Colors**: Deep blues and greens for fintech trust
- **Glassmorphism**: Frosted glass card effects
- **Gradients**: Subtle accent gradients
- **Typography**: Inter font family
- **Animations**: Smooth micro-interactions
- **Responsive**: Mobile-first design

## ⚠️ Assumptions & Limitations

1. **Data Accuracy**: Card data is based on publicly available information (January 2025). Banks may change terms.

2. **Simplified Calculations**: Real cards may have reward caps, tier limits, and excluded categories not modeled here.

3. **Lounge Value**: Fixed at ₹1,200/visit (average domestic lounge value).

4. **Credit Score**: Uses ranges, not exact scores. Approval is probabilistic.

5. **No Bank Integration**: This is a decision-support tool, not connected to actual bank systems.

6. **Rule-Based**: Uses deterministic scoring for transparency, not ML.

## 🔮 Future Enhancements

- [ ] Admin panel for card management
- [ ] Real-time card data updates
- [ ] User accounts and saved recommendations
- [ ] PDF report generation
- [ ] EMI and credit limit features


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is for educational purposes. Credit card information is based on publicly available data.

---

**Built with ❤️ for Indian Credit Card Users**

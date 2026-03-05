/**
 * UserInput Model
 * 
 * Stores user-submitted data for credit card recommendation analysis.
 * This includes spending patterns, lifestyle preferences, financial info,
 * and existing card holdings.
 */

const mongoose = require('mongoose');

const userInputSchema = new mongoose.Schema({
    // Monthly Spending Breakdown (in INR)
    spending: {
        food: {
            type: Number,
            default: 0,
            min: 0,
            description: 'Monthly spending on food & dining'
        },
        fuel: {
            type: Number,
            default: 0,
            min: 0,
            description: 'Monthly spending on fuel'
        },
        travel: {
            type: Number,
            default: 0,
            min: 0,
            description: 'Monthly spending on flights & hotels'
        },
        online: {
            type: Number,
            default: 0,
            min: 0,
            description: 'Monthly spending on online shopping'
        },
        offline: {
            type: Number,
            default: 0,
            min: 0,
            description: 'Monthly spending on offline retail'
        }
    },

    // Lifestyle Preferences
    travelFrequency: {
        type: String,
        enum: ['rare', 'occasional', 'frequent'],
        default: 'rare',
        description: 'How often the user travels'
    },

    loungeUsage: {
        type: String,
        enum: ['never', 'sometimes', 'frequent'],
        default: 'never',
        description: 'How often the user uses airport lounges'
    },

    rewardPreference: {
        type: String,
        enum: ['cashback', 'points'],
        default: 'cashback',
        description: 'User preference for reward type'
    },

    annualFeeTolerance: {
        type: String,
        enum: ['zero', 'low', 'high'],
        default: 'zero',
        description: 'User tolerance for annual fees (zero=₹0, low=₹1K-3K, high=₹3K+)'
    },

    // Financial Information (Optional)
    monthlyIncome: {
        type: Number,
        default: null,
        min: 0,
        description: 'User monthly income in INR (optional)'
    },

    creditScore: {
        type: String,
        enum: ['poor', 'fair', 'good', 'excellent', null],
        default: null,
        description: 'User credit score range (optional)'
    },

    // Existing Cards
    existingCardIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CreditCard'
    }],

    // Session tracking
    sessionId: {
        type: String,
        description: 'Browser session ID for anonymous users'
    }
}, {
    timestamps: true
});

// Indexes
userInputSchema.index({ createdAt: -1 });
userInputSchema.index({ sessionId: 1 });

/**
 * Virtual: Total monthly spending
 */
userInputSchema.virtual('totalMonthlySpending').get(function () {
    const s = this.spending;
    return s.food + s.fuel + s.travel + s.online + s.offline;
});

/**
 * Virtual: Yearly spending
 */
userInputSchema.virtual('yearlySpending').get(function () {
    return this.totalMonthlySpending * 12;
});

/**
 * Virtual: Top spending category
 */
userInputSchema.virtual('topSpendingCategory').get(function () {
    const s = this.spending;
    const categories = [
        { name: 'food', value: s.food },
        { name: 'fuel', value: s.fuel },
        { name: 'travel', value: s.travel },
        { name: 'online', value: s.online },
        { name: 'offline', value: s.offline }
    ];

    return categories.reduce((max, cat) =>
        cat.value > max.value ? cat : max
    );
});

/**
 * Method: Convert credit score range to numeric value for comparison
 */
userInputSchema.methods.getCreditScoreValue = function () {
    const scoreMap = {
        'poor': 550,      // 300-649
        'fair': 675,      // 650-699
        'good': 725,      // 700-749
        'excellent': 800  // 750-900
    };

    return scoreMap[this.creditScore] || null;
};

/**
 * Method: Get estimated lounge visits per year
 */
userInputSchema.methods.getEstimatedLoungeVisits = function () {
    const loungeMap = {
        'never': 0,
        'sometimes': 4,   // ~once per quarter
        'frequent': 12    // ~once per month
    };

    return loungeMap[this.loungeUsage] || 0;
};

/**
 * Method: Get annual fee limit based on tolerance
 */
userInputSchema.methods.getAnnualFeeLimit = function () {
    const feeMap = {
        'zero': 0,
        'low': 3000,
        'high': Infinity
    };

    return feeMap[this.annualFeeTolerance] || 0;
};

// Ensure virtuals are included in JSON output
userInputSchema.set('toJSON', { virtuals: true });
userInputSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('UserInput', userInputSchema);

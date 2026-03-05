/**
 * CreditCard Model
 * 
 * Represents a credit card in the database with all its reward structures,
 * fees, eligibility criteria, and benefits.
 */

const mongoose = require('mongoose');

const creditCardSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Card name is required'],
        trim: true
    },
    bank: {
        type: String,
        required: [true, 'Bank name is required'],
        trim: true
    },
    cardNetwork: {
        type: String,
        enum: ['Visa', 'Mastercard', 'Amex', 'RuPay', 'Diners'],
        default: 'Visa'
    },

    // Fees
    annualFee: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    joiningFee: {
        type: Number,
        default: 0,
        min: 0
    },
    feeWaiverSpend: {
        type: Number,
        default: null,
        description: 'Annual spend required to waive annual fee (null if no waiver)'
    },

    // Reward Structure
    rewardType: {
        type: String,
        enum: ['cashback', 'points'],
        required: true
    },

    /**
     * Reward rates per category
     * For cashback: percentage value (e.g., 5 means 5% cashback)
     * For points: points earned per ₹100 spent
     */
    rewards: {
        food: {
            type: Number,
            default: 1,
            min: 0
        },
        fuel: {
            type: Number,
            default: 1,
            min: 0
        },
        travel: {
            type: Number,
            default: 1,
            min: 0
        },
        online: {
            type: Number,
            default: 1,
            min: 0
        },
        offline: {
            type: Number,
            default: 1,
            min: 0
        },
        default: {
            type: Number,
            default: 1,
            min: 0,
            description: 'Default reward rate for uncategorized spending'
        }
    },

    /**
     * Point value conversion
     * Value of 1 reward point in INR
     * For cashback cards, this is 1 (1% = 1 rupee per 100 spent)
     */
    pointValue: {
        type: Number,
        default: 0.25,
        min: 0,
        description: 'Value of 1 reward point in INR'
    },

    // Lounge Access
    loungeAccess: {
        domestic: {
            type: Number,
            default: 0,
            min: 0,
            description: 'Number of free domestic lounge visits per year'
        },
        international: {
            type: Number,
            default: 0,
            min: 0,
            description: 'Number of free international lounge visits per year'
        }
    },

    /**
     * Average value of a single lounge visit in INR
     * Default: ₹1200 for domestic, international may be higher
     */
    loungeValuePerVisit: {
        type: Number,
        default: 1200,
        min: 0
    },

    // Eligibility Criteria
    eligibility: {
        minMonthlyIncome: {
            type: Number,
            required: true,
            min: 0,
            description: 'Minimum monthly income required in INR'
        },
        minCreditScore: {
            type: Number,
            default: 650,
            min: 300,
            max: 900,
            description: 'Minimum credit score required (CIBIL)'
        }
    },

    // Additional Information
    benefits: [{
        type: String,
        trim: true
    }],

    bestFor: {
        type: String,
        trim: true,
        description: 'User profile this card is best suited for'
    },

    // Special category bonuses (e.g., Amazon, Flipkart specific)
    specialPartners: [{
        name: String,
        rewardRate: Number,
        description: String
    }],

    // Metadata
    isActive: {
        type: Boolean,
        default: true
    },
    imageUrl: {
        type: String,
        default: null
    },
    applyUrl: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
creditCardSchema.index({ bank: 1, isActive: 1 });
creditCardSchema.index({ annualFee: 1 });
creditCardSchema.index({ rewardType: 1 });
creditCardSchema.index({ 'eligibility.minMonthlyIncome': 1 });

/**
 * Virtual: Total lounge access (domestic + international)
 */
creditCardSchema.virtual('totalLoungeAccess').get(function () {
    return this.loungeAccess.domestic + this.loungeAccess.international;
});

/**
 * Method: Check if user is eligible based on income and credit score
 */
creditCardSchema.methods.checkEligibility = function (monthlyIncome, creditScore) {
    const meetsIncome = monthlyIncome >= this.eligibility.minMonthlyIncome;
    const meetsScore = creditScore >= this.eligibility.minCreditScore;

    return {
        eligible: meetsIncome && meetsScore,
        meetsIncome,
        meetsScore,
        incomeShortfall: meetsIncome ? 0 : this.eligibility.minMonthlyIncome - monthlyIncome,
        scoreShortfall: meetsScore ? 0 : this.eligibility.minCreditScore - creditScore
    };
};

/**
 * Static: Find cards by annual fee range
 */
creditCardSchema.statics.findByFeeRange = function (tolerance) {
    const feeRanges = {
        'zero': { $eq: 0 },
        'low': { $gt: 0, $lte: 3000 },
        'high': { $gt: 3000 }
    };

    return this.find({
        annualFee: feeRanges[tolerance] || { $gte: 0 },
        isActive: true
    });
};

// Ensure virtuals are included in JSON output
creditCardSchema.set('toJSON', { virtuals: true });
creditCardSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CreditCard', creditCardSchema);

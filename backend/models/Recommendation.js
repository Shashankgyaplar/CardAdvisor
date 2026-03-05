/**
 * Recommendation Model
 * 
 * Stores the recommendation results generated for a user input.
 * Includes ranked cards, net benefit calculations, warnings,
 * and existing card optimization suggestions.
 */

const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    // Link to user input
    userInputId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserInput',
        required: true
    },

    // Ranked card recommendations
    recommendations: [{
        cardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CreditCard',
            required: true
        },
        rank: {
            type: Number,
            required: true,
            min: 1
        },

        // Net yearly benefit (can be negative)
        netYearlyBenefit: {
            type: Number,
            required: true
        },

        // Detailed breakdown of benefit calculation
        breakdown: {
            foodRewards: {
                type: Number,
                default: 0
            },
            fuelRewards: {
                type: Number,
                default: 0
            },
            travelRewards: {
                type: Number,
                default: 0
            },
            onlineRewards: {
                type: Number,
                default: 0
            },
            offlineRewards: {
                type: Number,
                default: 0
            },
            loungeValue: {
                type: Number,
                default: 0
            },
            totalRewards: {
                type: Number,
                default: 0
            },
            annualFeeCost: {
                type: Number,
                default: 0
            }
        },

        // Human-readable reasons for recommendation
        reasons: [{
            type: String
        }],

        // Warnings about potential issues
        warnings: [{
            warningType: {
                type: String
            },
            message: {
                type: String
            },
            severity: {
                type: String,
                enum: ['info', 'warning', 'critical'],
                default: 'warning'
            }
        }],

        // Approval probability based on eligibility
        approvalProbability: {
            type: String,
            enum: ['high', 'medium', 'low', 'unknown'],
            default: 'unknown'
        },

        // Match score (internal, for ranking)
        matchScore: {
            type: Number,
            default: 0
        }
    }],

    // Existing card analysis (if user has existing cards)
    existingCardAnalysis: {
        // Cards to keep
        keepCards: [{
            cardId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'CreditCard'
            },
            reason: String
        }],

        // Cards to consider closing
        closeCards: [{
            cardId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'CreditCard'
            },
            reason: String,
            potentialSavings: Number
        }],

        // Upgrade recommendations
        upgradeCards: [{
            fromCardId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'CreditCard'
            },
            toCardId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'CreditCard'
            },
            reason: String,
            additionalBenefit: Number
        }],

        // Best card for each spending category
        categoryOptimization: {
            food: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'CreditCard'
            },
            fuel: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'CreditCard'
            },
            travel: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'CreditCard'
            },
            online: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'CreditCard'
            },
            offline: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'CreditCard'
            }
        },

        // Detected overlapping benefits
        overlappingBenefits: [{
            type: String
        }]
    },

    // Summary statistics
    summary: {
        topCardBenefit: Number,
        averageBenefit: Number,
        cardsAnalyzed: Number,
        eligibleCards: Number
    }
}, {
    timestamps: true
});

// Indexes
recommendationSchema.index({ userInputId: 1 });
recommendationSchema.index({ createdAt: -1 });

/**
 * Virtual: Best recommendation
 */
recommendationSchema.virtual('bestRecommendation').get(function () {
    return this.recommendations.find(r => r.rank === 1);
});

/**
 * Virtual: Has warnings
 */
recommendationSchema.virtual('hasWarnings').get(function () {
    return this.recommendations.some(r => r.warnings && r.warnings.length > 0);
});

/**
 * Virtual: Has existing card suggestions
 */
recommendationSchema.virtual('hasExistingCardSuggestions').get(function () {
    const analysis = this.existingCardAnalysis;
    return analysis && (
        (analysis.closeCards && analysis.closeCards.length > 0) ||
        (analysis.upgradeCards && analysis.upgradeCards.length > 0)
    );
});

// Ensure virtuals are included in JSON output
recommendationSchema.set('toJSON', { virtuals: true });
recommendationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Recommendation', recommendationSchema);

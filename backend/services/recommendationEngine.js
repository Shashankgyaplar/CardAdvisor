/**
 * Recommendation Engine Service
 * 
 * Core business logic for calculating credit card recommendations.
 * Implements the scoring algorithm to rank cards based on user spending patterns,
 * lifestyle preferences, and calculate net yearly benefits.
 */

const CreditCard = require('../models/CreditCard');

/**
 * Configuration constants for the recommendation engine
 */
const CONFIG = {
    // Estimated value per lounge visit in INR
    LOUNGE_VALUE_DOMESTIC: 1200,
    LOUNGE_VALUE_INTERNATIONAL: 2500,

    // Lounge usage mapping (visits per year)
    LOUNGE_USAGE_MAP: {
        never: 0,
        sometimes: 4,
        frequent: 12
    },

    // Credit score to numeric mapping
    CREDIT_SCORE_MAP: {
        poor: 550,
        fair: 675,
        good: 725,
        excellent: 800
    },

    // Annual fee tolerance to max fee
    FEE_TOLERANCE_MAP: {
        zero: 0,
        low: 3000,
        high: Infinity
    },

    // Preference weight multipliers
    PREFERENCE_WEIGHTS: {
        cashback: {
            cashback: 1.2,  // 20% bonus for matching preference
            points: 0.8     // 20% penalty for non-matching
        },
        points: {
            cashback: 0.8,
            points: 1.2
        }
    }
};

/**
 * Main recommendation engine class
 */
class RecommendationEngine {

    /**
     * Calculate the net yearly benefit for a credit card given user inputs
     * 
     * @param {Object} card - CreditCard document
     * @param {Object} userInput - UserInput document
     * @returns {Object} Calculation result with breakdown
     */
    calculateNetBenefit(card, userInput) {
        const spending = userInput.spending;
        const yearly = 12; // Months in a year

        // Initialize breakdown
        const breakdown = {
            foodRewards: 0,
            fuelRewards: 0,
            travelRewards: 0,
            onlineRewards: 0,
            offlineRewards: 0,
            loungeValue: 0,
            totalRewards: 0,
            annualFeeCost: card.annualFee
        };

        // Calculate rewards based on card type
        if (card.rewardType === 'cashback') {
            // Cashback: rewards are percentage values
            breakdown.foodRewards = (spending.food * (card.rewards.food / 100) * yearly);
            breakdown.fuelRewards = (spending.fuel * (card.rewards.fuel / 100) * yearly);
            breakdown.travelRewards = (spending.travel * (card.rewards.travel / 100) * yearly);
            breakdown.onlineRewards = (spending.online * (card.rewards.online / 100) * yearly);
            breakdown.offlineRewards = (spending.offline * (card.rewards.offline / 100) * yearly);
        } else {
            // Points: rewards are points per ₹100, need to convert to rupee value
            const pointValue = card.pointValue || 0.25;

            breakdown.foodRewards = (spending.food / 100 * card.rewards.food * pointValue * yearly);
            breakdown.fuelRewards = (spending.fuel / 100 * card.rewards.fuel * pointValue * yearly);
            breakdown.travelRewards = (spending.travel / 100 * card.rewards.travel * pointValue * yearly);
            breakdown.onlineRewards = (spending.online / 100 * card.rewards.online * pointValue * yearly);
            breakdown.offlineRewards = (spending.offline / 100 * card.rewards.offline * pointValue * yearly);
        }

        // Calculate total rewards
        breakdown.totalRewards =
            breakdown.foodRewards +
            breakdown.fuelRewards +
            breakdown.travelRewards +
            breakdown.onlineRewards +
            breakdown.offlineRewards;

        // Calculate lounge value
        const estimatedVisits = CONFIG.LOUNGE_USAGE_MAP[userInput.loungeUsage] || 0;
        const totalLoungeAccess = (card.loungeAccess?.domestic || 0) + (card.loungeAccess?.international || 0);
        const usableVisits = Math.min(estimatedVisits, totalLoungeAccess);

        // Use card's lounge value or default
        const loungeValuePerVisit = card.loungeValuePerVisit || CONFIG.LOUNGE_VALUE_DOMESTIC;
        breakdown.loungeValue = usableVisits * loungeValuePerVisit;

        // Calculate net benefit
        const netBenefit = breakdown.totalRewards + breakdown.loungeValue - breakdown.annualFeeCost;

        // Round all values to 2 decimal places
        Object.keys(breakdown).forEach(key => {
            breakdown[key] = Math.round(breakdown[key] * 100) / 100;
        });

        return {
            netYearlyBenefit: Math.round(netBenefit * 100) / 100,
            breakdown
        };
    }

    /**
     * Calculate a match score for ranking purposes
     * Takes into account user preferences beyond just net benefit
     * 
     * @param {Object} card - CreditCard document
     * @param {Object} userInput - UserInput document
     * @param {number} netBenefit - Calculated net benefit
     * @returns {number} Match score
     */
    calculateMatchScore(card, userInput, netBenefit) {
        let score = netBenefit;

        // Apply preference weight
        const preferenceWeight = CONFIG.PREFERENCE_WEIGHTS[userInput.rewardPreference]?.[card.rewardType] || 1;
        score *= preferenceWeight;

        // Bonus for cards matching top spending category
        const topCategory = this.getTopSpendingCategory(userInput.spending);
        if (topCategory && card.rewards[topCategory] > card.rewards.default) {
            score *= 1.1; // 10% bonus for category match
        }

        // Penalty for cards exceeding fee tolerance
        const feeLimit = CONFIG.FEE_TOLERANCE_MAP[userInput.annualFeeTolerance] || 0;
        if (card.annualFee > feeLimit) {
            score *= 0.5; // 50% penalty for exceeding fee tolerance
        }

        // Bonus for frequent travelers with lounge access
        if (userInput.travelFrequency === 'frequent' && card.loungeAccess) {
            const totalLounge = (card.loungeAccess.domestic || 0) + (card.loungeAccess.international || 0);
            if (totalLounge >= 8) {
                score *= 1.15; // 15% bonus for good lounge access
            }
        }

        return Math.round(score * 100) / 100;
    }

    /**
     * Generate human-readable reasons for recommending a card
     * 
     * @param {Object} card - CreditCard document
     * @param {Object} userInput - UserInput document
     * @param {Object} breakdown - Benefit breakdown
     * @returns {string[]} Array of reasons
     */
    generateReasons(card, userInput, breakdown) {
        const reasons = [];
        const topCategory = this.getTopSpendingCategory(userInput.spending);

        // Reason based on top spending category
        if (topCategory) {
            const categoryNames = {
                food: 'food & dining',
                fuel: 'fuel',
                travel: 'travel',
                online: 'online shopping',
                offline: 'retail shopping'
            };

            const categoryReward = card.rewards[topCategory];
            if (categoryReward > card.rewards.default) {
                if (card.rewardType === 'cashback') {
                    reasons.push(`Offers ${categoryReward}% cashback on ${categoryNames[topCategory]}, your highest spending category`);
                } else {
                    reasons.push(`Earns ${categoryReward} points per ₹100 on ${categoryNames[topCategory]}, your highest spending category`);
                }
            }
        }

        // Reason based on total rewards
        if (breakdown.totalRewards > 5000) {
            reasons.push(`You could earn ₹${Math.round(breakdown.totalRewards).toLocaleString('en-IN')} in annual rewards based on your spending`);
        } else if (breakdown.totalRewards > 1000) {
            reasons.push(`Estimated ₹${Math.round(breakdown.totalRewards).toLocaleString('en-IN')} in yearly rewards`);
        }

        // Reason based on lounge access
        if (breakdown.loungeValue > 0 && userInput.loungeUsage !== 'never') {
            const totalLounge = (card.loungeAccess?.domestic || 0) + (card.loungeAccess?.international || 0);
            reasons.push(`Includes ${totalLounge} complimentary lounge visits per year (value: ₹${Math.round(breakdown.loungeValue).toLocaleString('en-IN')})`);
        }

        // Reason based on annual fee
        if (card.annualFee === 0) {
            reasons.push('No annual fee - pure savings');
        } else if (card.feeWaiverSpend) {
            reasons.push(`Annual fee of ₹${card.annualFee.toLocaleString('en-IN')} can be waived by spending ₹${card.feeWaiverSpend.toLocaleString('en-IN')}/year`);
        }

        // Add best for description
        if (card.bestFor) {
            reasons.push(`Best suited for: ${card.bestFor}`);
        }

        return reasons;
    }

    /**
     * Get the top spending category from user spending
     * 
     * @param {Object} spending - User spending object
     * @returns {string|null} Top category name or null
     */
    getTopSpendingCategory(spending) {
        const categories = ['food', 'fuel', 'travel', 'online', 'offline'];
        let topCategory = null;
        let maxSpend = 0;

        categories.forEach(cat => {
            if (spending[cat] > maxSpend) {
                maxSpend = spending[cat];
                topCategory = cat;
            }
        });

        return topCategory;
    }

    /**
     * Main recommendation function
     * 
     * @param {Object} userInput - UserInput document
     * @param {CreditCard[]} cards - Array of credit cards to evaluate
     * @returns {Object[]} Sorted array of recommendations
     */
    async generateRecommendations(userInput, cards = null) {
        // Fetch all active cards if not provided
        if (!cards) {
            cards = await CreditCard.find({ isActive: true });
        }

        // Calculate benefits for each card
        const results = cards.map(card => {
            const { netYearlyBenefit, breakdown } = this.calculateNetBenefit(card, userInput);
            const matchScore = this.calculateMatchScore(card, userInput, netYearlyBenefit);
            const reasons = this.generateReasons(card, userInput, breakdown);

            return {
                cardId: card._id,
                card: card, // Include full card for API response
                netYearlyBenefit,
                breakdown,
                matchScore,
                reasons
            };
        });

        // Sort by match score (descending)
        results.sort((a, b) => b.matchScore - a.matchScore);

        // Add rank
        results.forEach((result, index) => {
            result.rank = index + 1;
        });

        return results;
    }

    /**
     * Get top N recommendations
     * 
     * @param {Object} userInput - UserInput document
     * @param {number} limit - Maximum number of recommendations
     * @returns {Object[]} Top recommendations
     */
    async getTopRecommendations(userInput, limit = 3) {
        const allRecommendations = await this.generateRecommendations(userInput);
        return allRecommendations.slice(0, limit);
    }
}

module.exports = new RecommendationEngine();
module.exports.CONFIG = CONFIG;
module.exports.RecommendationEngine = RecommendationEngine;

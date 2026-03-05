/**
 * Fee Detection Service
 * 
 * Detects hidden fees, wasted benefits, and potential card mismatches.
 * Generates human-readable warnings to help users understand potential issues.
 */

/**
 * Warning severity levels
 */
const SEVERITY = {
    INFO: 'info',
    WARNING: 'warning',
    CRITICAL: 'critical'
};

/**
 * Fee Detection Service class
 */
class FeeDetectionService {

    /**
     * Main function to detect all potential issues with a card recommendation
     * 
     * @param {Object} card - CreditCard document
     * @param {Object} userInput - UserInput document
     * @param {Object} breakdown - Benefit breakdown from recommendation engine
     * @returns {Object[]} Array of warning objects
     */
    detectWarnings(card, userInput, breakdown) {
        const warnings = [];

        // Check for fee exceeding rewards
        warnings.push(...this.checkFeeExceedsRewards(card, breakdown));

        // Check for unused lounge access
        warnings.push(...this.checkUnusedLoungeAccess(card, userInput));

        // Check for spending pattern mismatch
        warnings.push(...this.checkSpendingMismatch(card, userInput));

        // Check for fee tolerance violation
        warnings.push(...this.checkFeeTolerance(card, userInput));

        // Check for better alternatives in user's existing cards
        warnings.push(...this.checkBetterAlternatives(card, userInput));

        return warnings;
    }

    /**
     * Check if annual fee exceeds the rewards earned
     * 
     * @param {Object} card - CreditCard document
     * @param {Object} breakdown - Benefit breakdown
     * @returns {Object[]} Warnings array
     */
    checkFeeExceedsRewards(card, breakdown) {
        const warnings = [];

        if (card.annualFee === 0) {
            return warnings; // No fee, no problem
        }

        const totalValue = breakdown.totalRewards + breakdown.loungeValue;

        // Critical: Fee exceeds total value
        if (card.annualFee > totalValue) {
            const loss = card.annualFee - totalValue;
            warnings.push({
                type: 'fee_exceeds_rewards',
                severity: SEVERITY.CRITICAL,
                message: `⚠️ Annual fee (₹${card.annualFee.toLocaleString('en-IN')}) exceeds your expected rewards (₹${Math.round(totalValue).toLocaleString('en-IN')}). You would lose ₹${Math.round(loss).toLocaleString('en-IN')} per year.`
            });
        }
        // Warning: Fee is more than 80% of rewards
        else if (card.annualFee > totalValue * 0.8) {
            warnings.push({
                type: 'fee_near_rewards',
                severity: SEVERITY.WARNING,
                message: `Annual fee (₹${card.annualFee.toLocaleString('en-IN')}) is close to your expected rewards. Net benefit is minimal.`
            });
        }

        return warnings;
    }

    /**
     * Check if user would waste lounge access
     * 
     * @param {Object} card - CreditCard document
     * @param {Object} userInput - UserInput document
     * @returns {Object[]} Warnings array
     */
    checkUnusedLoungeAccess(card, userInput) {
        const warnings = [];

        const totalLoungeAccess = (card.loungeAccess?.domestic || 0) + (card.loungeAccess?.international || 0);

        // Skip if card has no lounge access
        if (totalLoungeAccess === 0) {
            return warnings;
        }

        // Check if user never uses lounges but card has significant lounge benefit
        if (userInput.loungeUsage === 'never' && totalLoungeAccess >= 4) {
            const wastedValue = totalLoungeAccess * (card.loungeValuePerVisit || 1200);
            warnings.push({
                type: 'unused_lounge',
                severity: SEVERITY.WARNING,
                message: `You indicated you never use airport lounges, but this card offers ${totalLoungeAccess} free visits/year (value: ₹${wastedValue.toLocaleString('en-IN')}). Consider a card with lower fees and no lounge benefits.`
            });
        }

        // Check if user uses lounges sometimes but card has excessive access
        if (userInput.loungeUsage === 'sometimes' && totalLoungeAccess >= 12) {
            warnings.push({
                type: 'excess_lounge',
                severity: SEVERITY.INFO,
                message: `This card offers ${totalLoungeAccess} lounge visits, but you may only use 4-6 per year. You might not fully utilize this benefit.`
            });
        }

        return warnings;
    }

    /**
     * Check if card's reward structure matches user's spending pattern
     * 
     * @param {Object} card - CreditCard document
     * @param {Object} userInput - UserInput document
     * @returns {Object[]} Warnings array
     */
    checkSpendingMismatch(card, userInput) {
        const warnings = [];
        const spending = userInput.spending;

        // Find user's top spending category
        const categories = ['food', 'fuel', 'travel', 'online', 'offline'];
        let topCategory = null;
        let maxSpend = 0;

        categories.forEach(cat => {
            if (spending[cat] > maxSpend) {
                maxSpend = spending[cat];
                topCategory = cat;
            }
        });

        if (!topCategory || maxSpend === 0) {
            return warnings;
        }

        // Check if card's best reward category matches user's top spending
        const cardRewards = card.rewards || {};
        let cardBestCategory = null;
        let cardMaxReward = 0;

        categories.forEach(cat => {
            if ((cardRewards[cat] || 0) > cardMaxReward) {
                cardMaxReward = cardRewards[cat];
                cardBestCategory = cat;
            }
        });

        // Check for mismatch
        if (cardBestCategory && cardBestCategory !== topCategory) {
            const categoryNames = {
                food: 'food & dining',
                fuel: 'fuel',
                travel: 'travel',
                online: 'online shopping',
                offline: 'retail shopping'
            };

            // Only warn if there's a significant difference
            const topCategoryReward = cardRewards[topCategory] || cardRewards.default || 1;
            if (cardMaxReward > topCategoryReward * 1.5) {
                warnings.push({
                    type: 'spending_mismatch',
                    severity: SEVERITY.INFO,
                    message: `This card offers best rewards for ${categoryNames[cardBestCategory]}, but your highest spending is on ${categoryNames[topCategory]}. Consider cards optimized for your spending pattern.`
                });
            }
        }

        return warnings;
    }

    /**
     * Check if card violates user's fee tolerance
     * 
     * @param {Object} card - CreditCard document
     * @param {Object} userInput - UserInput document
     * @returns {Object[]} Warnings array
     */
    checkFeeTolerance(card, userInput) {
        const warnings = [];

        const toleranceLimits = {
            zero: 0,
            low: 3000,
            high: Infinity
        };

        const limit = toleranceLimits[userInput.annualFeeTolerance] || 0;

        if (card.annualFee > limit) {
            if (userInput.annualFeeTolerance === 'zero') {
                warnings.push({
                    type: 'fee_tolerance_exceeded',
                    severity: SEVERITY.WARNING,
                    message: `This card has an annual fee of ₹${card.annualFee.toLocaleString('en-IN')}, but you prefer cards with no annual fees.`
                });
            } else if (userInput.annualFeeTolerance === 'low') {
                warnings.push({
                    type: 'fee_tolerance_exceeded',
                    severity: SEVERITY.WARNING,
                    message: `This card's annual fee (₹${card.annualFee.toLocaleString('en-IN')}) exceeds your preference of ₹1,000-3,000.`
                });
            }
        }

        return warnings;
    }

    /**
     * Check if user might have better alternatives in existing cards
     * (Placeholder - actual implementation needs existing card data)
     * 
     * @param {Object} card - CreditCard document
     * @param {Object} userInput - UserInput document
     * @returns {Object[]} Warnings array
     */
    checkBetterAlternatives(card, userInput) {
        // This will be implemented when we process existing cards
        return [];
    }

    /**
     * Aggregate warnings for all recommended cards
     * 
     * @param {Object[]} recommendations - Array of recommendation objects
     * @param {Object} userInput - UserInput document
     * @returns {Object[]} Aggregated warnings
     */
    aggregateWarnings(recommendations, userInput) {
        const allWarnings = [];

        recommendations.forEach((rec, index) => {
            const cardWarnings = this.detectWarnings(rec.card, userInput, rec.breakdown);
            cardWarnings.forEach(warning => {
                allWarnings.push({
                    ...warning,
                    cardId: rec.cardId,
                    cardName: rec.card.name,
                    rank: index + 1
                });
            });
        });

        return allWarnings;
    }
}

module.exports = new FeeDetectionService();
module.exports.SEVERITY = SEVERITY;
module.exports.FeeDetectionService = FeeDetectionService;

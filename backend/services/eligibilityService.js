/**
 * Eligibility Service
 * 
 * Calculates approval probability for credit cards based on
 * user's income and credit score range.
 */

/**
 * Approval probability levels
 */
const APPROVAL_PROBABILITY = {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
    UNKNOWN: 'unknown'
};

/**
 * Credit score range mappings to numeric values
 */
const CREDIT_SCORE_VALUES = {
    poor: 550,      // 300-649
    fair: 675,      // 650-699
    good: 725,      // 700-749
    excellent: 800  // 750-900
};

/**
 * Eligibility Service class
 */
class EligibilityService {

    /**
     * Calculate approval probability for a user-card combination
     * 
     * @param {Object} card - CreditCard document
     * @param {Object} userInput - UserInput document
     * @returns {Object} Eligibility result with probability and reasons
     */
    calculateApprovalProbability(card, userInput) {
        const result = {
            probability: APPROVAL_PROBABILITY.UNKNOWN,
            eligible: false,
            reasons: [],
            requirements: {
                minIncome: card.eligibility?.minMonthlyIncome || 0,
                minCreditScore: card.eligibility?.minCreditScore || 650
            }
        };

        // If user didn't provide financial info, return unknown
        if (!userInput.monthlyIncome && !userInput.creditScore) {
            result.reasons.push('Financial information not provided. Add income and credit score for accurate approval probability.');
            return result;
        }

        // Convert credit score range to numeric value
        const userCreditScore = CREDIT_SCORE_VALUES[userInput.creditScore] || null;
        const userIncome = userInput.monthlyIncome;

        // Check income requirement
        let incomeCheck = { passed: true, reason: '' };
        if (userIncome && card.eligibility?.minMonthlyIncome) {
            if (userIncome >= card.eligibility.minMonthlyIncome) {
                incomeCheck = {
                    passed: true,
                    margin: userIncome - card.eligibility.minMonthlyIncome,
                    reason: `Income (₹${userIncome.toLocaleString('en-IN')}) meets requirement (₹${card.eligibility.minMonthlyIncome.toLocaleString('en-IN')})`
                };
            } else {
                incomeCheck = {
                    passed: false,
                    shortfall: card.eligibility.minMonthlyIncome - userIncome,
                    reason: `Income (₹${userIncome.toLocaleString('en-IN')}) is below requirement (₹${card.eligibility.minMonthlyIncome.toLocaleString('en-IN')})`
                };
            }
            result.reasons.push(incomeCheck.reason);
        } else if (!userIncome) {
            incomeCheck = { passed: null, reason: 'Income not provided' };
        }

        // Check credit score requirement
        let scoreCheck = { passed: true, reason: '' };
        if (userCreditScore && card.eligibility?.minCreditScore) {
            if (userCreditScore >= card.eligibility.minCreditScore) {
                scoreCheck = {
                    passed: true,
                    margin: userCreditScore - card.eligibility.minCreditScore,
                    reason: `Credit score (${userInput.creditScore}) meets requirement (${card.eligibility.minCreditScore}+)`
                };
            } else {
                scoreCheck = {
                    passed: false,
                    shortfall: card.eligibility.minCreditScore - userCreditScore,
                    reason: `Credit score (${userInput.creditScore}, ~${userCreditScore}) may be below requirement (${card.eligibility.minCreditScore}+)`
                };
            }
            result.reasons.push(scoreCheck.reason);
        } else if (!userCreditScore) {
            scoreCheck = { passed: null, reason: 'Credit score not provided' };
        }

        // Determine overall probability
        result.probability = this.determineProbability(incomeCheck, scoreCheck, userInput);
        result.eligible = result.probability !== APPROVAL_PROBABILITY.LOW;

        return result;
    }

    /**
     * Determine approval probability based on income and credit checks
     * 
     * @param {Object} incomeCheck - Income check result
     * @param {Object} scoreCheck - Credit score check result
     * @param {Object} userInput - UserInput document
     * @returns {string} Approval probability level
     */
    determineProbability(incomeCheck, scoreCheck, userInput) {
        // If both checks are null (no data), return unknown
        if (incomeCheck.passed === null && scoreCheck.passed === null) {
            return APPROVAL_PROBABILITY.UNKNOWN;
        }

        // If either fails, low probability
        if (incomeCheck.passed === false || scoreCheck.passed === false) {
            return APPROVAL_PROBABILITY.LOW;
        }

        // If only one is provided and passes
        if (incomeCheck.passed === null || scoreCheck.passed === null) {
            if (incomeCheck.passed === true || scoreCheck.passed === true) {
                return APPROVAL_PROBABILITY.MEDIUM;
            }
        }

        // Both pass - determine level based on margin
        if (incomeCheck.passed === true && scoreCheck.passed === true) {
            // High probability if significantly above requirements
            const hasGoodMargin =
                (incomeCheck.margin && incomeCheck.margin > 20000) ||
                (scoreCheck.margin && scoreCheck.margin > 50);

            // Excellent credit score bonus
            const excellentCredit = userInput.creditScore === 'excellent';

            if (hasGoodMargin || excellentCredit) {
                return APPROVAL_PROBABILITY.HIGH;
            }

            return APPROVAL_PROBABILITY.MEDIUM;
        }

        return APPROVAL_PROBABILITY.MEDIUM;
    }

    /**
     * Batch calculate eligibility for multiple cards
     * 
     * @param {Object[]} cards - Array of CreditCard documents
     * @param {Object} userInput - UserInput document
     * @returns {Map} Map of cardId to eligibility result
     */
    calculateEligibilityBatch(cards, userInput) {
        const eligibilityMap = new Map();

        cards.forEach(card => {
            eligibilityMap.set(
                card._id.toString(),
                this.calculateApprovalProbability(card, userInput)
            );
        });

        return eligibilityMap;
    }

    /**
     * Filter cards by eligibility
     * 
     * @param {Object[]} cards - Array of CreditCard documents
     * @param {Object} userInput - UserInput document
     * @param {boolean} includeUnknown - Whether to include cards with unknown eligibility
     * @returns {Object[]} Filtered cards
     */
    filterByEligibility(cards, userInput, includeUnknown = true) {
        return cards.filter(card => {
            const result = this.calculateApprovalProbability(card, userInput);

            if (result.probability === APPROVAL_PROBABILITY.LOW) {
                return false;
            }

            if (!includeUnknown && result.probability === APPROVAL_PROBABILITY.UNKNOWN) {
                return false;
            }

            return true;
        });
    }

    /**
     * Get eligibility summary for UI display
     * 
     * @param {string} probability - Approval probability level
     * @returns {Object} Display properties
     */
    getEligibilityDisplayInfo(probability) {
        const displayInfo = {
            [APPROVAL_PROBABILITY.HIGH]: {
                label: 'High Approval Chance',
                color: 'green',
                icon: '✓',
                description: 'You likely meet all eligibility requirements'
            },
            [APPROVAL_PROBABILITY.MEDIUM]: {
                label: 'Medium Approval Chance',
                color: 'yellow',
                icon: '~',
                description: 'You may meet the requirements. Apply to find out.'
            },
            [APPROVAL_PROBABILITY.LOW]: {
                label: 'Low Approval Chance',
                color: 'red',
                icon: '✗',
                description: 'You may not meet the minimum requirements'
            },
            [APPROVAL_PROBABILITY.UNKNOWN]: {
                label: 'Unknown',
                color: 'gray',
                icon: '?',
                description: 'Add income and credit score for eligibility check'
            }
        };

        return displayInfo[probability] || displayInfo[APPROVAL_PROBABILITY.UNKNOWN];
    }
}

module.exports = new EligibilityService();
module.exports.APPROVAL_PROBABILITY = APPROVAL_PROBABILITY;
module.exports.CREDIT_SCORE_VALUES = CREDIT_SCORE_VALUES;
module.exports.EligibilityService = EligibilityService;

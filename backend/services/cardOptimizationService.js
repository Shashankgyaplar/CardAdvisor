/**
 * Card Optimization Service
 * 
 * Analyzes user's existing cards and provides optimization suggestions:
 * - Best card for each spending category
 * - Cards to keep vs close
 * - Upgrade/downgrade recommendations
 * - Overlapping benefit detection
 */

const recommendationEngine = require('./recommendationEngine');

/**
 * Card Optimization Service class
 */
class CardOptimizationService {

    /**
     * Main function to analyze and optimize user's existing cards
     * 
     * @param {Object} userInput - UserInput document (with populated existingCards)
     * @param {Object[]} existingCards - Array of CreditCard documents user currently holds
     * @param {Object[]} allCards - All available cards for upgrade comparison
     * @returns {Object} Optimization analysis result
     */
    analyzeExistingCards(userInput, existingCards, allCards = []) {
        if (!existingCards || existingCards.length === 0) {
            return null;
        }

        const analysis = {
            keepCards: [],
            closeCards: [],
            upgradeCards: [],
            categoryOptimization: {},
            overlappingBenefits: [],
            totalCurrentBenefit: 0,
            potentialSavings: 0
        };

        // Calculate benefits for each existing card
        const cardBenefits = existingCards.map(card => {
            const { netYearlyBenefit, breakdown } = recommendationEngine.calculateNetBenefit(card, userInput);
            return {
                card,
                netYearlyBenefit,
                breakdown
            };
        });

        // Find best card for each category
        analysis.categoryOptimization = this.findBestCardPerCategory(existingCards, userInput);

        // Detect overlapping benefits
        analysis.overlappingBenefits = this.detectOverlappingBenefits(existingCards);

        // Determine keep vs close recommendations
        cardBenefits.forEach(({ card, netYearlyBenefit, breakdown }) => {
            if (netYearlyBenefit > 0) {
                // Card is profitable - recommend keeping
                analysis.keepCards.push({
                    cardId: card._id,
                    card: card,
                    reason: this.generateKeepReason(card, netYearlyBenefit, breakdown, analysis.categoryOptimization),
                    netBenefit: netYearlyBenefit
                });
                analysis.totalCurrentBenefit += netYearlyBenefit;
            } else {
                // Card is loss-making - recommend closing
                analysis.closeCards.push({
                    cardId: card._id,
                    card: card,
                    reason: this.generateCloseReason(card, netYearlyBenefit, breakdown),
                    potentialSavings: Math.abs(netYearlyBenefit)
                });
                analysis.potentialSavings += Math.abs(netYearlyBenefit);
            }
        });

        // Find upgrade opportunities
        if (allCards && allCards.length > 0) {
            analysis.upgradeCards = this.findUpgradeOpportunities(existingCards, allCards, userInput);
        }

        return analysis;
    }

    /**
     * Find the best card for each spending category
     * 
     * @param {Object[]} cards - User's existing cards
     * @param {Object} userInput - UserInput document
     * @returns {Object} Category to best card mapping
     */
    findBestCardPerCategory(cards, userInput) {
        const categories = ['food', 'fuel', 'travel', 'online', 'offline'];
        const optimization = {};

        categories.forEach(category => {
            let bestCard = null;
            let bestReward = 0;

            cards.forEach(card => {
                const rewardRate = card.rewards?.[category] || card.rewards?.default || 0;

                // For points cards, convert to effective value
                let effectiveRate = rewardRate;
                if (card.rewardType === 'points') {
                    effectiveRate = rewardRate * (card.pointValue || 0.25);
                }

                if (effectiveRate > bestReward) {
                    bestReward = effectiveRate;
                    bestCard = card;
                }
            });

            if (bestCard) {
                optimization[category] = {
                    cardId: bestCard._id,
                    cardName: bestCard.name,
                    rewardRate: bestReward,
                    monthlySpend: userInput.spending[category],
                    yearlyReward: this.calculateCategoryReward(bestCard, category, userInput.spending[category])
                };
            }
        });

        return optimization;
    }

    /**
     * Calculate yearly reward for a specific category
     * 
     * @param {Object} card - CreditCard document
     * @param {string} category - Spending category
     * @param {number} monthlySpend - Monthly spending amount
     * @returns {number} Yearly reward value
     */
    calculateCategoryReward(card, category, monthlySpend) {
        const rewardRate = card.rewards?.[category] || card.rewards?.default || 0;
        const yearly = 12;

        if (card.rewardType === 'cashback') {
            return (monthlySpend * (rewardRate / 100) * yearly);
        } else {
            const pointValue = card.pointValue || 0.25;
            return (monthlySpend / 100 * rewardRate * pointValue * yearly);
        }
    }

    /**
     * Detect overlapping benefits between cards
     * 
     * @param {Object[]} cards - User's existing cards
     * @returns {string[]} Array of overlap descriptions
     */
    detectOverlappingBenefits(cards) {
        const overlaps = [];

        if (cards.length < 2) {
            return overlaps;
        }

        // Check for duplicate lounge access
        const cardsWithLounge = cards.filter(c =>
            (c.loungeAccess?.domestic || 0) + (c.loungeAccess?.international || 0) > 0
        );

        if (cardsWithLounge.length > 1) {
            const loungeCardNames = cardsWithLounge.map(c => c.name).join(', ');
            const totalLounge = cardsWithLounge.reduce((sum, c) =>
                sum + (c.loungeAccess?.domestic || 0) + (c.loungeAccess?.international || 0), 0
            );
            overlaps.push(
                `Multiple cards (${loungeCardNames}) provide lounge access. Total: ${totalLounge} visits/year. You may not need all of them.`
            );
        }

        // Check for same reward category focus
        const categories = ['food', 'fuel', 'travel', 'online', 'offline'];

        categories.forEach(category => {
            const cardsGoodForCategory = cards.filter(c => {
                const rate = c.rewards?.[category] || 0;
                const defaultRate = c.rewards?.default || 1;
                return rate > defaultRate * 1.5; // Card has bonus on this category
            });

            if (cardsGoodForCategory.length > 1) {
                const categoryNames = {
                    food: 'food & dining',
                    fuel: 'fuel',
                    travel: 'travel',
                    online: 'online shopping',
                    offline: 'retail shopping'
                };
                overlaps.push(
                    `Multiple cards (${cardsGoodForCategory.map(c => c.name).join(', ')}) offer high rewards on ${categoryNames[category]}. Consider consolidating to one card.`
                );
            }
        });

        // Check for same bank cards
        const bankGroups = {};
        cards.forEach(card => {
            if (!bankGroups[card.bank]) {
                bankGroups[card.bank] = [];
            }
            bankGroups[card.bank].push(card);
        });

        Object.keys(bankGroups).forEach(bank => {
            if (bankGroups[bank].length > 1) {
                overlaps.push(
                    `You have ${bankGroups[bank].length} cards from ${bank}: ${bankGroups[bank].map(c => c.name).join(', ')}. Consider consolidating for easier management.`
                );
            }
        });

        return overlaps;
    }

    /**
     * Generate reason for keeping a card
     * 
     * @param {Object} card - CreditCard document
     * @param {number} netBenefit - Net yearly benefit
     * @param {Object} breakdown - Benefit breakdown
     * @param {Object} categoryOptimization - Category optimization map
     * @returns {string} Keep reason
     */
    generateKeepReason(card, netBenefit, breakdown, categoryOptimization) {
        const reasons = [];

        // Check if it's the best card for any category
        const categories = ['food', 'fuel', 'travel', 'online', 'offline'];
        const bestForCategories = categories.filter(cat =>
            categoryOptimization[cat]?.cardId?.toString() === card._id.toString()
        );

        if (bestForCategories.length > 0) {
            const categoryNames = {
                food: 'food & dining',
                fuel: 'fuel',
                travel: 'travel',
                online: 'online shopping',
                offline: 'retail shopping'
            };
            reasons.push(`Best card for ${bestForCategories.map(c => categoryNames[c]).join(', ')}`);
        }

        // Check for lounge benefit
        if (breakdown.loungeValue > 0) {
            reasons.push(`Provides ₹${Math.round(breakdown.loungeValue).toLocaleString('en-IN')} in lounge value`);
        }

        // Net benefit
        reasons.push(`Net yearly benefit: ₹${Math.round(netBenefit).toLocaleString('en-IN')}`);

        return reasons.join('. ');
    }

    /**
     * Generate reason for closing a card
     * 
     * @param {Object} card - CreditCard document
     * @param {number} netBenefit - Net yearly benefit (negative)
     * @param {Object} breakdown - Benefit breakdown
     * @returns {string} Close reason
     */
    generateCloseReason(card, netBenefit, breakdown) {
        const reasons = [];

        reasons.push(`Net yearly loss: ₹${Math.round(Math.abs(netBenefit)).toLocaleString('en-IN')}`);

        if (card.annualFee > breakdown.totalRewards) {
            reasons.push(`Annual fee (₹${card.annualFee.toLocaleString('en-IN')}) exceeds rewards earned (₹${Math.round(breakdown.totalRewards).toLocaleString('en-IN')})`);
        }

        return reasons.join('. ');
    }

    /**
     * Find upgrade opportunities for existing cards
     * 
     * @param {Object[]} existingCards - User's existing cards
     * @param {Object[]} allCards - All available cards
     * @param {Object} userInput - UserInput document
     * @returns {Object[]} Upgrade recommendations
     */
    findUpgradeOpportunities(existingCards, allCards, userInput) {
        const upgrades = [];

        existingCards.forEach(existingCard => {
            // Find cards from the same bank that might be upgrades
            const sameBankCards = allCards.filter(c =>
                c.bank === existingCard.bank &&
                c._id.toString() !== existingCard._id.toString() &&
                c.annualFee > existingCard.annualFee
            );

            sameBankCards.forEach(upgradeCandidate => {
                const currentBenefit = recommendationEngine.calculateNetBenefit(existingCard, userInput);
                const upgradeBenefit = recommendationEngine.calculateNetBenefit(upgradeCandidate, userInput);

                const additionalBenefit = upgradeBenefit.netYearlyBenefit - currentBenefit.netYearlyBenefit;

                // Only recommend if upgrade provides meaningful additional benefit
                if (additionalBenefit > 1000) {
                    upgrades.push({
                        fromCardId: existingCard._id,
                        fromCard: existingCard,
                        toCardId: upgradeCandidate._id,
                        toCard: upgradeCandidate,
                        reason: `Upgrade would provide an additional ₹${Math.round(additionalBenefit).toLocaleString('en-IN')} in yearly benefits`,
                        additionalBenefit: Math.round(additionalBenefit),
                        currentBenefit: Math.round(currentBenefit.netYearlyBenefit),
                        upgradeBenefit: Math.round(upgradeBenefit.netYearlyBenefit)
                    });
                }
            });
        });

        // Sort by additional benefit
        upgrades.sort((a, b) => b.additionalBenefit - a.additionalBenefit);

        return upgrades;
    }
}

module.exports = new CardOptimizationService();
module.exports.CardOptimizationService = CardOptimizationService;

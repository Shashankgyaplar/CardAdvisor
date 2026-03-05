/**
 * Recommendation Controller
 * 
 * Handles HTTP requests for credit card recommendations.
 * Orchestrates the recommendation engine, fee detection,
 * card optimization, and eligibility services.
 */

const CreditCard = require('../models/CreditCard');
const UserInput = require('../models/UserInput');
const Recommendation = require('../models/Recommendation');
const recommendationEngine = require('../services/recommendationEngine');
const feeDetectionService = require('../services/feeDetectionService');
const cardOptimizationService = require('../services/cardOptimizationService');
const eligibilityService = require('../services/eligibilityService');

/**
 * Generate recommendations based on user input
 * POST /api/recommendations
 * 
 * Request body: UserInput data
 */
const generateRecommendations = async (req, res) => {
    try {
        const {
            spending,
            travelFrequency,
            loungeUsage,
            rewardPreference,
            annualFeeTolerance,
            monthlyIncome,
            creditScore,
            existingCardIds,
            sessionId
        } = req.body;

        // Validate required fields
        if (!spending) {
            return res.status(400).json({
                success: false,
                error: 'Spending data is required'
            });
        }

        // Create user input document
        const userInput = new UserInput({
            spending: {
                food: spending.food || 0,
                fuel: spending.fuel || 0,
                travel: spending.travel || 0,
                online: spending.online || 0,
                offline: spending.offline || 0
            },
            travelFrequency: travelFrequency || 'rare',
            loungeUsage: loungeUsage || 'never',
            rewardPreference: rewardPreference || 'cashback',
            annualFeeTolerance: annualFeeTolerance || 'zero',
            monthlyIncome: monthlyIncome || null,
            creditScore: creditScore || null,
            existingCardIds: existingCardIds || [],
            sessionId: sessionId || null
        });

        // Save user input
        await userInput.save();

        // Fetch all active cards
        const allCards = await CreditCard.find({ isActive: true });

        // Generate recommendations
        const recommendations = await recommendationEngine.generateRecommendations(userInput, allCards);

        // Add warnings and eligibility to each recommendation
        const enrichedRecommendations = recommendations.map(rec => {
            // Get warnings
            const warnings = feeDetectionService.detectWarnings(
                rec.card,
                userInput,
                rec.breakdown
            );

            // Get eligibility
            const eligibility = eligibilityService.calculateApprovalProbability(
                rec.card,
                userInput
            );

            return {
                ...rec,
                warnings,
                approvalProbability: eligibility.probability,
                eligibilityDetails: eligibility
            };
        });

        // Process existing cards if provided
        let existingCardAnalysis = null;
        if (existingCardIds && existingCardIds.length > 0) {
            const existingCards = await CreditCard.find({
                _id: { $in: existingCardIds }
            });

            existingCardAnalysis = cardOptimizationService.analyzeExistingCards(
                userInput,
                existingCards,
                allCards
            );
        }

        // Save recommendation to database
        let savedRecommendation = null;
        try {
            const recommendation = new Recommendation({
                userInputId: userInput._id,
                recommendations: enrichedRecommendations.slice(0, 10).map(rec => ({
                    cardId: rec.card._id,
                    rank: rec.rank,
                    netYearlyBenefit: rec.netYearlyBenefit,
                    breakdown: rec.breakdown,
                    reasons: rec.reasons,
                    warnings: (rec.warnings || []).map(w => ({
                        warningType: w.type,
                        message: w.message,
                        severity: w.severity
                    })),
                    approvalProbability: rec.approvalProbability || 'unknown',
                    matchScore: rec.matchScore || 0
                })),
                summary: {
                    topCardBenefit: enrichedRecommendations[0]?.netYearlyBenefit || 0,
                    averageBenefit: enrichedRecommendations.reduce((s, r) => s + r.netYearlyBenefit, 0) / enrichedRecommendations.length,
                    cardsAnalyzed: allCards.length,
                    eligibleCards: enrichedRecommendations.length
                }
            });
            savedRecommendation = await recommendation.save();
        } catch (saveErr) {
            console.error('Warning: Failed to save recommendation to DB:', saveErr.message);
        }

        // Prepare response with top 3 recommendations
        const topRecommendations = enrichedRecommendations.slice(0, 3);

        res.json({
            success: true,
            data: {
                userInputId: userInput._id,
                topRecommendations: topRecommendations.map(rec => ({
                    rank: rec.rank,
                    card: {
                        id: rec.card._id,
                        name: rec.card.name,
                        bank: rec.card.bank,
                        cardNetwork: rec.card.cardNetwork,
                        annualFee: rec.card.annualFee,
                        rewardType: rec.card.rewardType,
                        rewards: rec.card.rewards,
                        loungeAccess: rec.card.loungeAccess,
                        benefits: rec.card.benefits,
                        bestFor: rec.card.bestFor,
                        eligibility: rec.card.eligibility
                    },
                    netYearlyBenefit: rec.netYearlyBenefit,
                    breakdown: rec.breakdown,
                    reasons: rec.reasons,
                    warnings: rec.warnings,
                    approvalProbability: rec.approvalProbability,
                    eligibilityDetails: rec.eligibilityDetails
                })),
                existingCardAnalysis: existingCardAnalysis ? {
                    keepCards: existingCardAnalysis.keepCards,
                    closeCards: existingCardAnalysis.closeCards,
                    upgradeCards: existingCardAnalysis.upgradeCards,
                    categoryOptimization: existingCardAnalysis.categoryOptimization,
                    overlappingBenefits: existingCardAnalysis.overlappingBenefits,
                    totalCurrentBenefit: existingCardAnalysis.totalCurrentBenefit,
                    potentialSavings: existingCardAnalysis.potentialSavings
                } : null,
                summary: {
                    topCardBenefit: topRecommendations[0]?.netYearlyBenefit || 0,
                    totalCardsAnalyzed: allCards.length,
                    userTotalMonthlySpend: Object.values(userInput.spending).reduce((a, b) => a + b, 0),
                    userTotalYearlySpend: Object.values(userInput.spending).reduce((a, b) => a + b, 0) * 12
                },
                allRecommendations: enrichedRecommendations.slice(0, 10).map(rec => ({
                    rank: rec.rank,
                    cardId: rec.card._id,
                    cardName: rec.card.name,
                    bank: rec.card.bank,
                    netYearlyBenefit: rec.netYearlyBenefit,
                    approvalProbability: rec.approvalProbability
                }))
            }
        });

    } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate recommendations',
            message: error.message
        });
    }
};

/**
 * Get recommendation by ID
 * GET /api/recommendations/:id
 */
const getRecommendationById = async (req, res) => {
    try {
        const { id } = req.params;

        const recommendation = await Recommendation.findById(id)
            .populate('recommendations.cardId')
            .populate('userInputId');

        if (!recommendation) {
            return res.status(404).json({
                success: false,
                error: 'Recommendation not found'
            });
        }

        res.json({
            success: true,
            data: recommendation
        });

    } catch (error) {
        console.error('Error fetching recommendation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recommendation',
            message: error.message
        });
    }
};

/**
 * Quick calculate for a single card
 * POST /api/recommendations/calculate
 * 
 * Returns benefit calculation without saving
 */
const quickCalculate = async (req, res) => {
    try {
        const { cardId, spending, loungeUsage } = req.body;

        if (!cardId || !spending) {
            return res.status(400).json({
                success: false,
                error: 'Card ID and spending data are required'
            });
        }

        const card = await CreditCard.findById(cardId);

        if (!card) {
            return res.status(404).json({
                success: false,
                error: 'Card not found'
            });
        }

        // Create temporary user input for calculation
        const tempUserInput = {
            spending: {
                food: spending.food || 0,
                fuel: spending.fuel || 0,
                travel: spending.travel || 0,
                online: spending.online || 0,
                offline: spending.offline || 0
            },
            loungeUsage: loungeUsage || 'never'
        };

        const result = recommendationEngine.calculateNetBenefit(card, tempUserInput);

        res.json({
            success: true,
            data: {
                card: {
                    id: card._id,
                    name: card.name,
                    bank: card.bank,
                    annualFee: card.annualFee
                },
                ...result
            }
        });

    } catch (error) {
        console.error('Error in quick calculate:', error);
        res.status(500).json({
            success: false,
            error: 'Calculation failed',
            message: error.message
        });
    }
};

/**
 * Compare multiple cards
 * POST /api/recommendations/compare
 */
const compareCards = async (req, res) => {
    try {
        const { cardIds, spending, loungeUsage } = req.body;

        if (!cardIds || !Array.isArray(cardIds) || cardIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one card ID is required'
            });
        }

        const cards = await CreditCard.find({
            _id: { $in: cardIds }
        });

        const tempUserInput = {
            spending: spending || { food: 0, fuel: 0, travel: 0, online: 0, offline: 0 },
            loungeUsage: loungeUsage || 'never'
        };

        const comparisons = cards.map(card => {
            const result = recommendationEngine.calculateNetBenefit(card, tempUserInput);
            return {
                card: {
                    id: card._id,
                    name: card.name,
                    bank: card.bank,
                    annualFee: card.annualFee,
                    rewardType: card.rewardType,
                    loungeAccess: card.loungeAccess
                },
                ...result
            };
        });

        // Sort by net benefit
        comparisons.sort((a, b) => b.netYearlyBenefit - a.netYearlyBenefit);

        res.json({
            success: true,
            data: {
                comparisons,
                bestCard: comparisons[0],
                worstCard: comparisons[comparisons.length - 1]
            }
        });

    } catch (error) {
        console.error('Error comparing cards:', error);
        res.status(500).json({
            success: false,
            error: 'Comparison failed',
            message: error.message
        });
    }
};

module.exports = {
    generateRecommendations,
    getRecommendationById,
    quickCalculate,
    compareCards
};

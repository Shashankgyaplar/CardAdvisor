/**
 * Card Controller
 * 
 * Handles HTTP requests for credit card operations.
 */

const CreditCard = require('../models/CreditCard');

/**
 * Get all credit cards
 * GET /api/cards
 * 
 * Query params:
 * - bank: Filter by bank name
 * - rewardType: Filter by cashback or points
 * - maxFee: Maximum annual fee
 * - minIncome: Maximum required income (for eligibility)
 */
const getAllCards = async (req, res) => {
    try {
        const { bank, rewardType, maxFee, minIncome, limit } = req.query;

        // Build filter
        const filter = { isActive: true };

        if (bank) {
            filter.bank = { $regex: bank, $options: 'i' };
        }

        if (rewardType && ['cashback', 'points'].includes(rewardType)) {
            filter.rewardType = rewardType;
        }

        if (maxFee !== undefined) {
            filter.annualFee = { $lte: parseInt(maxFee) };
        }

        if (minIncome !== undefined) {
            filter['eligibility.minMonthlyIncome'] = { $lte: parseInt(minIncome) };
        }

        // Execute query
        let query = CreditCard.find(filter).sort({ annualFee: 1, name: 1 });

        if (limit) {
            query = query.limit(parseInt(limit));
        }

        const cards = await query;

        res.json({
            success: true,
            count: cards.length,
            data: cards
        });

    } catch (error) {
        console.error('Error fetching cards:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch credit cards',
            message: error.message
        });
    }
};

/**
 * Get single credit card by ID
 * GET /api/cards/:id
 */
const getCardById = async (req, res) => {
    try {
        const { id } = req.params;

        const card = await CreditCard.findById(id);

        if (!card) {
            return res.status(404).json({
                success: false,
                error: 'Card not found'
            });
        }

        res.json({
            success: true,
            data: card
        });

    } catch (error) {
        console.error('Error fetching card:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch credit card',
            message: error.message
        });
    }
};

/**
 * Get cards by bank
 * GET /api/cards/bank/:bankName
 */
const getCardsByBank = async (req, res) => {
    try {
        const { bankName } = req.params;

        const cards = await CreditCard.find({
            bank: { $regex: bankName, $options: 'i' },
            isActive: true
        }).sort({ annualFee: 1 });

        res.json({
            success: true,
            count: cards.length,
            data: cards
        });

    } catch (error) {
        console.error('Error fetching cards by bank:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch credit cards',
            message: error.message
        });
    }
};

/**
 * Get unique bank names
 * GET /api/cards/banks
 */
const getBankNames = async (req, res) => {
    try {
        const banks = await CreditCard.distinct('bank', { isActive: true });

        res.json({
            success: true,
            count: banks.length,
            data: banks.sort()
        });

    } catch (error) {
        console.error('Error fetching bank names:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bank names',
            message: error.message
        });
    }
};

/**
 * Get cards filtered by fee tolerance
 * GET /api/cards/fee/:tolerance
 * tolerance: zero, low, high
 */
const getCardsByFeeTolerance = async (req, res) => {
    try {
        const { tolerance } = req.params;

        const cards = await CreditCard.findByFeeRange(tolerance);

        res.json({
            success: true,
            count: cards.length,
            tolerance,
            data: cards
        });

    } catch (error) {
        console.error('Error fetching cards by fee:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch credit cards',
            message: error.message
        });
    }
};

module.exports = {
    getAllCards,
    getCardById,
    getCardsByBank,
    getBankNames,
    getCardsByFeeTolerance
};

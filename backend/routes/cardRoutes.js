/**
 * Card Routes
 * 
 * API endpoints for credit card operations
 */

const express = require('express');
const router = express.Router();
const {
    getAllCards,
    getCardById,
    getCardsByBank,
    getBankNames,
    getCardsByFeeTolerance
} = require('../controllers/cardController');

/**
 * @route   GET /api/cards
 * @desc    Get all credit cards with optional filters
 * @query   bank, rewardType, maxFee, minIncome, limit
 * @access  Public
 */
router.get('/', getAllCards);

/**
 * @route   GET /api/cards/banks
 * @desc    Get list of all bank names
 * @access  Public
 */
router.get('/banks', getBankNames);

/**
 * @route   GET /api/cards/fee/:tolerance
 * @desc    Get cards by fee tolerance (zero, low, high)
 * @access  Public
 */
router.get('/fee/:tolerance', getCardsByFeeTolerance);

/**
 * @route   GET /api/cards/bank/:bankName
 * @desc    Get cards by bank name
 * @access  Public
 */
router.get('/bank/:bankName', getCardsByBank);

/**
 * @route   GET /api/cards/:id
 * @desc    Get single card by ID
 * @access  Public
 */
router.get('/:id', getCardById);

module.exports = router;

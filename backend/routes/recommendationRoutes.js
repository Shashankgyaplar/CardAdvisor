/**
 * Recommendation Routes
 * 
 * API endpoints for recommendation operations
 */

const express = require('express');
const router = express.Router();
const {
    generateRecommendations,
    getRecommendationById,
    quickCalculate,
    compareCards
} = require('../controllers/recommendationController');

/**
 * @route   POST /api/recommendations
 * @desc    Generate personalized card recommendations
 * @body    UserInput data
 * @access  Public
 */
router.post('/', generateRecommendations);

/**
 * @route   POST /api/recommendations/calculate
 * @desc    Quick calculate benefit for a single card
 * @body    { cardId, spending, loungeUsage }
 * @access  Public
 */
router.post('/calculate', quickCalculate);

/**
 * @route   POST /api/recommendations/compare
 * @desc    Compare multiple cards
 * @body    { cardIds, spending, loungeUsage }
 * @access  Public
 */
router.post('/compare', compareCards);

/**
 * @route   GET /api/recommendations/:id
 * @desc    Get recommendation by ID
 * @access  Public
 */
router.get('/:id', getRecommendationById);

module.exports = router;

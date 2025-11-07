const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const protect = require('../middleware/authMiddleware');

router.post('/:id/share', protect, boardController.generateShareToken);
router.post('/join', protect, boardController.redeemShareToken);

module.exports = router;
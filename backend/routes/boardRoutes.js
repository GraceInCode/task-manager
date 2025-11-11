const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const cardController = require('../controllers/cardController');
const protect = require('../middleware/authMiddleware');

router.post('/:id/share', protect, boardController.generateShareToken);
router.post('/join', protect, boardController.redeemShareToken);
router.post('/:boardId/cards', protect, cardController.createCard);

// Board CRUD
router.get('/', protect, boardController.getUserBoards)
router.post('/', protect, boardController.createBoard)
router.get('/:id', protect, boardController.getBoard)
router.put('/:id', protect, boardController.updateBoard)
router.delete('/:id', protect, boardController.deleteBoard)

module.exports = router;
const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const protect = require('../middleware/authMiddleware');

router.put('/:id', protect, cardController.updateCard);
router.get('/:id/comments', protect, cardController.getComments);
router.post('/:id/comments', protect, cardController.addComment);
router.post('/:id/attachments', protect, cardController.uploadAttachment);
router.get('/:id/attachments', protect, cardController.getAttachments);

module.exports = router;
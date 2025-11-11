const { PrismaClient } = require('../generated/client');
const prisma = new PrismaClient();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'task-attachments' },
})

const upload = multer({ storage });

// Helper to check if user can access board
const canAccessBoard = async (req, boardId) => {
  const board = await prisma.board.findUnique({
    where: { id: parseInt(boardId) },
    include: { collaborators: { select: { id: true } } },
  });
  if (!board || (board.ownerId !== req.user.id && !board.collaborators.some(c => c.id === req.user.id))) {
    return false;
  }
  return true;
};

// Create card
exports.createCard = async (req, res) => {
  const { title, description, listName = 'To Do' } = req.body;  // Removed boardId from here
  const boardId = parseInt(req.params.boardId);  // Get from URL param
  if (!title || isNaN(boardId)) return res.status(400).json({ msg: 'Title and valid boardId are required' });

  try {
    const canAccess = await canAccessBoard(req, boardId);
    if (!canAccess) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    // Get next position in list
    const lastCard = await prisma.card.findFirst({
      where: { boardId, listName },
      orderBy: { position: 'desc' }
    });
    const position = lastCard ? lastCard.position + 1 : 0;

    const card = await prisma.card.create({
      data: {
        title,
        description,
        boardId,
        listName,
        position,
      },
      include: { assignee: true }
    });

    const io = req.app.get('io');
    io.to(boardId.toString()).emit('cardUpdated', card);

    res.status(201).json(card);
  } catch (err) {
    console.error('Create card error:', err);
    res.status(500).json({ msg: 'Internal server error' });
  }
};
// Update card
exports.updateCard = async (req, res) => {
  const cardId = parseInt(req.params.id);
  const { title, description, listName, position } = req.body;

  try {
    const card = await prisma.card.findUnique({ where: { id: cardId }, include: { board: true } });
    if (!card) return res.status(404).json({ msg: 'Card not found' });

    const canAccess = await canAccessBoard(req, card.boardId);
    if (!canAccess) return res.status(403).json({ msg: 'Access denied' });

    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: { title, description, listName, position },
      include: { assignee: true }
    });
    const io = req.app.get('io');
    io.to(card.boardId.toString()).emit('cardUpdated', updatedCard);
    res.json(updatedCard);
  } catch (err) {
    console.error('Update card error:', err);
    res.status(500).json({ msg: 'Internal server error' });
  }
};

// get Comments
exports.getComments = async (req, res) => {
  const cardId = parseInt(req.params.id);

  try {
    const card = await prisma.card.findUnique({ where: { id: cardId }, include: { board: true } });
    if (!card) return res.status(404).json({ msg: 'Card not found' });

    const canAccess = await canAccessBoard(req, card.boardId);
    if (!canAccess) return res.status(403).json({ msg: 'Access denied' });

    const comments = await prisma.comment.findMany({
      where: { cardId },
      orderBy: { timestamp: 'asc' },
      include: { user: true },  
      });
    res.json(comments);
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ msg: 'Internal server error' });
  }
};

// Add Comment
exports.addComment = async (req, res) => {
  const cardId = parseInt(req.params.id);
  const { text } = req.body;
  if (!text) return res.status(400).json({ msg: 'Text required' });

  try {
    const card = await prisma.card.findUnique({ where: { id: cardId }, include: { board: true } });
    if (!card) return res.status(404).json({ msg: 'Card not found' });

    const canAccess = await canAccessBoard(req, card.boardId);
    if (!canAccess) return res.status(403).json({ msg: 'Access denied' });

    const comment = await prisma.comment.create({
      data: { text, userId: req.user.id, cardId },
    });
    const io = req.app.get('io');
    io.to(card.boardId.toString()).emit('commentAdded', {cardId,comment});
    res.status(201).json(comment);
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ msg: 'Internal server error' });
  }
};

exports.uploadAttachment = async (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ msg: 'File upload failed', details: err.message });
    }

    const cardId = parseInt(req.params.id);
    try {
      
      if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

      const card = await prisma.card.findUnique({ where: { id: cardId }, include: { board: true } });
      if (!card) return res.status(404).json({ msg: 'Card not found' });

      const canAccess = await canAccessBoard(req, card.boardId);
      if (!canAccess) return res.status(403).json({ msg: 'Access denied' });

      const attachment = await prisma.attachment.create({
        data: {
          url: req.file.path,
          filename: req.file.originalname,
          userId: req.user.id,
          cardId,
        },
      });

      const io = req.app.get('io');
      io.to(card.boardId.toString()).emit('attachmentAdded', { cardId, attachment });
      res.json(attachment);
    } catch (err) {
      console.error('Upload attachment error:', err);
      res.status(500).json({ msg: 'Internal server error', details: err.message });
    }
  });
};
const { PrismaClient } = require('../generated/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

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

// Generate share token (only owner can do this)
exports.generateShareToken = async (req, res) => {
  const boardId = req.params.id;

  try {
    const board = await prisma.board.findUnique({ where: { id: parseInt(boardId) } });
    if (!board || board.ownerId !== req.user.id) {
      return res.status(403).json({ msg: 'Only the owner can generate share tokens' });
    }

    // Generate JWT token with boardId, expires in 7 days (adjust as needed)
    const shareToken = jwt.sign({ boardId: parseInt(boardId) }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ shareToken, msg: 'Share token generated' });
  } catch (err) {
    console.error('Generate token error:', err);
    res.status(500).json({ msg: 'Internal server error' });
  }
};

// Redeem share token (add authenticated user as collaborator)
exports.redeemShareToken = async (req, res) => {
    const { shareToken } = req.body;
    if (!shareToken) return res.status(400).json({ msg: 'Share token is required' });

    try {
        // Verify token
        const decoded = jwt.verify(shareToken, process.env.JWT_SECRET);
        const boardId = decoded.boardId;

        const board = await prisma.board.findUnique({
            where: { id: parseInt(boardId) },
            include: { collaborators: true },
        });
        if (!board) return res.status(404).json({ msg: 'Board not found' });

        // Check if user is already collaborator or owner
        if (board.ownerId === req.user.id || board.collaborators.some(c => c.id === req.user.id)) {
            return res.status(400).json({ msg: 'Already a member' });
        }

        // Add as collaborator
        await prisma.board.update({
            where: { id: boardId },
            data: { collaborators: { connect: { id: req.user.id } } },
        });

        const updatedBoard = await prisma.board.findUnique({
            where: { id: boardId },
            select: { id: true, title: true }
        });
        res.json(updatedBoard);
    } catch (err) {
        console.error('Redeem token error:', err);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

// Get all boards (owned + collaborated)
exports.getUserBoards = async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { collaborators: { some: { id: req.user.id } } },
        ],
      },
      include: { owner: true, collaborators: true, cards: true },
    });
    res.json(boards);
  } catch (err) {
    console.error('Get boards error:', err);
    res.status(500).json({ msg: 'Internal server error' });
  }
};

// Get board (with access check)
exports.getBoard = async (req, res) => {
  const boardId = req.params.id;

  try {
    const canAccess = await canAccessBoard(req, boardId);
    if (!canAccess) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const board = await prisma.board.findUnique({
      where: { id: parseInt(boardId) },
      include: { cards: true, collaborators: true },
    });
    if (!board) {
      return res.status(404).json({ msg: 'Board not found' });
    }

    res.json(board);
  } catch (err) {
    console.error('Get board error:', err);
    res.status(500).json({ msg: 'Internal server error' });
  }
};

// create Board
exports.createBoard = async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ msg: 'Title is required' });

  if (!req.user || !req.user.id) return res.status(401).json({ msg: 'Unauthorized' });

  try {
    const board = await prisma.board.create({
      data: {
        title,
        ownerId: req.user.id,
        collaborators: { connect: { id: req.user.id } },
      },
    });
    res.status(201).json(board);
  } catch (err) {
    console.error('Create board error:', err);
    res.status(500).json({ msg: 'Internal server error' });
  }
};

// update Board
exports.updateBoard = async (req, res) => {
  const boardId = req.params.id;
  const { title } = req.body;
  if (!title) return res.status(400).json({ msg: 'Title is required' });

  try {
    const canAccess = await canAccessBoard(req, boardId);
    if (!canAccess) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    const board = await prisma.board.update({
      where: { id: parseInt(boardId) },
      data: { title },
    });
    res.json(board);
  } catch (err) {
    console.error('Update board error:', err);
    res.status(500).json({ msg: 'Internal server error' });
  }
};

// delete Board
exports.deleteBoard = async (req, res) => {
  const boardId = req.params.id;

  try {
    const board = await prisma.board.findUnique({ where: { id: parseInt(boardId) } });
    if (!board) {
      return res.status(404).json({ msg: 'Board not found' });
    }
    if (board.ownerId !== req.user.id) {
      return res.status(403).json({ msg: 'Only the owner can delete the board' });
    }
    await prisma.board.delete({
      where: { id: parseInt(boardId) },
    });
    res.json({ msg: 'Board deleted' });
  } catch (err) {
    console.error('Delete board error:', err);
    res.status(500).json({ msg: 'Internal server error' });
  }
};
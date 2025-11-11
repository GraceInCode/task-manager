const { PrismaClient } = require('../generated/client');
const prisma = new PrismaClient();

const setupSockets = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.user.id);

    // Join board room
    socket.on('joinBoard', (boardId) => {
      socket.join(boardId.toString());
      console.log(`User ${socket.user.id} joined board ${boardId}`);
    });

    // Leave board room
    socket.on('leaveBoard', (boardId) => {
      socket.leave(boardId.toString());
      console.log(`User ${socket.user.id} left board ${boardId}`);
    });

    // Handle card moved
    socket.on('cardMoved', async ({ boardId, cardId, newList, newPosition }) => {
      try {
        const updatedCard = await prisma.card.update({
          where: { id: parseInt(cardId) },
          data: { listName: newList, position: newPosition },
          include: { assignee: true }
        });
        io.to(boardId.toString()).emit('cardUpdated', updatedCard);
      } catch (err) {
        console.error('Card move error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user.id);
    });
  });
};

module.exports = setupSockets;
require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });

const { PrismaClient } = require('./generated/client/');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

app.use(express.json());
app.use(require('cors')());

const authRoutes = require('./routes/authRoutes');
const boardRoutes = require('./routes/boardRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);

const protect = require('./middleware/authMiddleware');
app.get('/api/test-protected', protect, (req, res) => {
  res.json({ msg: `Hello user ${req.user.userId}` });
});

// Socket auth
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('No token'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

server.listen(process.env.PORT || 5000, () => console.log('Server on port 5000'));
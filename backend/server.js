require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: {
   origin: ['http://localhost:3000', 'https://studio-boards.vercel.app'],
   methods: ['GET', 'POST'],
   transports: ['websocket', 'polling']
   } 
  });

const { PrismaClient } = require('./generated/client/');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

app.use(express.json());
app.use(require('cors')({
  origin: ['http://localhost:3000', 'https://studio-boards.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

const authRoutes = require('./routes/authRoutes');
const boardRoutes = require('./routes/boardRoutes');
const cardRoutes = require('./routes/cardRoutes');

// Make io available to controllers
app.set('io', io);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/cards', cardRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err);  // Log full stack
  res.status(500).json({ msg: 'Internal server error', details: err.message || 'Unknown error' });
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

// Setup socket handlers
const setupSockets = require('./sockets/index');
setupSockets(io);

if (process.env.NODE_ENV !== 'test') {
  server.listen(process.env.PORT || 5000, () => {
    console.log('Server on port 5000');
    console.log('Environment check:', {
      hasDatabase: !!process.env.DATABASE_URL,
      hasJWT: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV
    });
  });
}

module.exports = app;

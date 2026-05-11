// Socket.IO connection and event management
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Store active user connections
const userSockets = new Map(); // userId -> Set of socket IDs

/**
 * Initialize Socket.IO handlers
 */
const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      console.log('🔐 Socket auth attempt - Token present:', !!token);
      
      if (!token) {
        console.log('❌ No authentication token provided');
        return next(new Error('No authentication token'));
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.error('⚠️ JWT_SECRET not set in environment variables!');
        return next(new Error('Server configuration error'));
      }

      console.log('✅ Verifying token with JWT_SECRET...');
      const decoded = jwt.verify(token, secret);
      console.log('✅ Token verified successfully for user:', decoded.id);
      
      socket.userId = decoded.id;
      socket.userEmail = decoded.email;
      next();
    } catch (error) {
      console.error('❌ Authentication error:', error.message);
      next(new Error(`Authentication failed: ${error.message}`));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User ${socket.userId} connected: ${socket.id}`);

    // Track user connection
    if (!userSockets.has(socket.userId)) {
      userSockets.set(socket.userId, new Set());
    }
    userSockets.get(socket.userId).add(socket.id);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);
    console.log(`📍 User ${socket.userId} joined room user:${socket.userId}`);

    // Listen for room subscriptions (for shared workspaces/groups)
    socket.on('subscribe:group', (groupId) => {
      socket.join(`group:${groupId}`);
      console.log(`User ${socket.userId} subscribed to group ${groupId}`);
    });

    socket.on('unsubscribe:group', (groupId) => {
      socket.leave(`group:${groupId}`);
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      const userSet = userSockets.get(socket.userId);
      if (userSet) {
        userSet.delete(socket.id);
        if (userSet.size === 0) {
          userSockets.delete(socket.userId);
        }
      }
      console.log(`🔌 User ${socket.userId} disconnected: ${socket.id}`);
    });

    // Error handler
    socket.on('error', (error) => {
      console.error(`❌ Socket error for user ${socket.userId}:`, error);
    });
  });
};

/**
 * Emit transaction events to relevant users
 */
const emitTransactionEvent = (io, eventType, transactionData, userId, groupId = null) => {
  const eventName = `transaction:${eventType}`;
  
  if (groupId) {
    // Emit to group
    io.to(`group:${groupId}`).emit(eventName, {
      type: eventType,
      data: transactionData,
      timestamp: new Date().toISOString()
    });
  } else {
    // Emit to specific user
    io.to(`user:${userId}`).emit(eventName, {
      type: eventType,
      data: transactionData,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Emit presence update (user came online/offline)
 */
const emitPresenceUpdate = (io, groupId, userId, status) => {
  io.to(`group:${groupId}`).emit('user:presence', {
    userId,
    status, // 'online' or 'offline'
    timestamp: new Date().toISOString()
  });
};

/**
 * Check if a user is online
 */
const isUserOnline = (userId) => {
  return userSockets.has(userId) && userSockets.get(userId).size > 0;
};

/**
 * Get active connections for a user
 */
const getUserConnections = (userId) => {
  return userSockets.get(userId) || new Set();
};

module.exports = {
  initializeSocket,
  emitTransactionEvent,
  emitPresenceUpdate,
  isUserOnline,
  getUserConnections
};

import io from 'socket.io-client';

let socket = null;

/**
 * Initialize Socket.IO connection
 */
export const initializeSocket = (token) => {
  if (socket) {
    console.log('✅ Socket already initialized');
    return socket;
  }

  const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:8888';
  console.log('🔌 Initializing WebSocket to:', serverUrl);
  console.log('🔑 Token present:', !!token);
  
  socket = io(serverUrl, {
    auth: {
      token
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('✅ Connected to WebSocket server');
    console.log('🆔 Socket ID:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from WebSocket server');
  });

  socket.on('connect_error', (error) => {
    console.error('🔴 WebSocket connection error:', error);
  });

  socket.on('error', (error) => {
    console.error('🔴 Socket error:', error);
  });

  socket.on('auth_error', (error) => {
    console.error('🔴 Authentication error:', error);
  });

  socket.onAny((eventName, ...args) => {
    console.log(`📡 Socket event: ${eventName}`, args);
  });

  console.log('🚀 Socket initialization started');

  return socket;
};

/**
 * Get current socket instance
 */
export const getSocket = () => {
  return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Subscribe to transaction:created events
 */
export const onTransactionCreated = (callback) => {
  if (socket) {
    socket.on('transaction:created', callback);
  }
};

/**
 * Subscribe to transaction:updated events
 */
export const onTransactionUpdated = (callback) => {
  if (socket) {
    socket.on('transaction:updated', callback);
  }
};

/**
 * Subscribe to transaction:deleted events
 */
export const onTransactionDeleted = (callback) => {
  if (socket) {
    socket.on('transaction:deleted', callback);
  }
};

/**
 * Subscribe to group notifications
 */
export const subscribeToGroup = (groupId) => {
  if (socket) {
    socket.emit('subscribe:group', groupId);
  }
};

/**
 * Unsubscribe from group notifications
 */
export const unsubscribeFromGroup = (groupId) => {
  if (socket) {
    socket.emit('unsubscribe:group', groupId);
  }
};

/**
 * Remove event listener
 */
export const offTransactionEvent = (eventType) => {
  if (socket) {
    socket.off(`transaction:${eventType}`);
  }
};

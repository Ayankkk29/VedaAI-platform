import { Server as SocketIOServer } from 'socket.io';

let io = null;

export function initSocketServer(server) {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*', // Allow connections from Next.js server
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to WebSocket: ${socket.id}`);

    // Join room for specific assignment monitoring
    socket.on('join_assignment_room', (assignmentId) => {
      socket.join(assignmentId);
      console.log(`👤 Client ${socket.id} joined room: assignment-${assignmentId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected from WebSocket: ${socket.id}`);
    });
  });

  console.log('📡 Socket.IO server configured.');
  return io;
}

export function emitAssignmentStatus(
  assignmentId,
  status,
  generatedPaper,
  errorMessage
) {
  if (!io) {
    console.warn('⚠️ Socket.IO not initialized. Event emission skipped.');
    return;
  }

  const payload = {
    assignmentId,
    status,
    generatedPaper,
    errorMessage,
    timestamp: new Date(),
  };

  // Broadcast to all clients in the channel for general list updates
  io.emit('assignment_status_update', payload);

  // Also send directly to specific assignment room if clients are watching
  io.to(`assignment-${assignmentId}`).emit('assignment_status_direct', payload);
  
  console.log(`📢 Broadcasted WebSocket event for: ${assignmentId} [${status}]`);
}

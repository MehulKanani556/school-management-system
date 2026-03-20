let ioInstance;
const userSocketMap = new Map(); // userId -> socketId
const socketUserMap = new Map(); // socketId -> userId

function initializeSocket(io) {
  ioInstance = io;
  
  io.on("connection", (socket) => {
    console.log("New socket connection:", socket.id);

    // Register user when they connect (expecting userId from client)
    socket.on("register_user", (userId) => {
      if (userId) {
        userSocketMap.set(userId, socket.id);
        socketUserMap.set(socket.id, userId);
        console.log(`User ${userId} registered to socket ${socket.id}`);
      }
    });

    socket.on("disconnect", (reason) => {
      const userId = socketUserMap.get(socket.id);
      if (userId) {
        userSocketMap.delete(userId);
        socketUserMap.delete(socket.id);
      }
      console.log(`Socket ${socket.id} disconnected: ${reason}`);
    });
  });
}

const getIo = () => ioInstance;

const sendToUser = (userId, event, data) => {
  const socketId = userSocketMap.get(userId.toString());
  if (socketId && ioInstance) {
    ioInstance.to(socketId).emit(event, data);
  }
};

const broadcastToRole = (role, event, data) => {
  if (ioInstance) {
    // If role is 'All', broadcast to everyone in the school (maybe use rooms per schoolId?)
    // For now, simpler broadcast
    ioInstance.emit(event, data);
  }
};

const broadcastNotice = (event, data) => {
    if (ioInstance) {
        ioInstance.emit(event, data);
    }
}

module.exports = { 
    initializeSocket, 
    getIo, 
    sendToUser, 
    broadcastToRole,
    broadcastNotice
};

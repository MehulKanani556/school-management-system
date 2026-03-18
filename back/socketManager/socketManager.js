// Store user-to-socket mappings
const userSocketMap = new Map();
const socketUserMap = new Map();

function initializeSocket(io) {
  io.on("connection", (socket) => {
    console.log("New socket connection:", socket.id);
  
  

    // Handle disconnect with cleanup
    socket.on("disconnect", (reason) => {
      console.log(`Socket ${socket.id} disconnected: ${reason}`);
      
      
    });

    // Handle reconnection
    socket.on("reconnect", () => {
      console.log(`Socket ${socket.id} reconnected`);
    });

   
    
  });

  // Cleanup disconnected sockets periodically
  setInterval(() => {
    const disconnectedSockets = [];
    
    for (const [socketId, userId] of socketUserMap.entries()) {
      const socket = io.sockets.sockets.get(socketId);
      if (!socket || !socket.connected) {
        disconnectedSockets.push({ socketId, userId });
      }
    }
    
    disconnectedSockets.forEach(({ socketId, userId }) => {
      userSocketMap.delete(userId);
      socketUserMap.delete(socketId);
      console.log(`Cleaned up disconnected socket ${socketId} for user ${userId}`);
    });
    
  
  }, 30000); // Check every 30 seconds
}

module.exports = { initializeSocket };

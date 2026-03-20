let ioInstance;
const userSocketMap = new Map(); // userId -> socketId
const socketUserMap = new Map(); // socketId -> userId
const Message = require('../models/message.model');

function initializeSocket(io) {
  ioInstance = io;
  
  io.on("connection", (socket) => {
    console.log("New socket connection:", socket.id);

    // Register user when they connect (expecting userId from client)
    socket.on("register_user", (userId) => {
      if (userId) {
        const idStr = userId.toString();
        userSocketMap.set(idStr, socket.id);
        socketUserMap.set(socket.id, idStr);
        console.log(`User ${idStr} registered to socket ${socket.id}`);
        // Join a private room for this user
        socket.join(idStr);
      }
    });

    socket.on("send_direct_message", async (data) => {
        try {
            const senderId = socketUserMap.get(socket.id);
            if (!senderId) return;

            const { recipient, subject, content, schoolId } = data;

            // Save to DB
            const message = await Message.create({
                schoolId,
                sender: senderId,
                recipient,
                type: 'DirectMessage',
                targetRole: 'Specific',
                subject,
                content
            });

            const populated = await message.populate([
                { path: 'sender', select: 'firstName lastName photo role' },
                { path: 'recipient', select: 'firstName lastName photo role' }
            ]);

            // Real-time send to recipient (via room or individual socket)
            io.to(recipient.toString()).emit('new_direct_message', populated);
            // Send back to sender to confirm and update UI
            socket.emit('new_direct_message', populated);

        } catch (err) {
            console.error("Socket direct message error:", err);
            socket.emit('error', { message: 'Message delivery failed' });
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

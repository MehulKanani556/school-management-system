let ioInstance;
const userSocketMap = new Map(); // userId -> socketId
const socketUserMap = new Map(); // socketId -> userId
const vehicleLocationMap = new Map(); // vehicleId -> { lat, lng, updatedAt }
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

    // Vehicle Location Tracking
    socket.on("subscribe_to_vehicle", (vehicleId) => {
        if (vehicleId) {
            socket.join(`vehicle_${vehicleId}`);
            console.log(`Socket ${socket.id} subscribed to vehicle ${vehicleId}`);
            
            // Send last known location if exists
            if (vehicleLocationMap.has(vehicleId.toString())) {
                socket.emit("vehicle_location_updated", vehicleLocationMap.get(vehicleId.toString()));
            }
        }
    });

    socket.on("update_vehicle_location", (data) => {
        const { vehicleId, lat, lng } = data;
        if (vehicleId && lat && lng) {
            const updatePayload = { vehicleId, lat, lng, updatedAt: new Date() };
            vehicleLocationMap.set(vehicleId.toString(), updatePayload);
            
            // Broadcast to all subscribers for this vehicle
            io.to(`vehicle_${vehicleId}`).emit("vehicle_location_updated", updatePayload);
            
            // Also broadcast to a general fleet management room if anyone is watching everything
            io.to("fleet_management").emit("fleet_location_updated", updatePayload);
        }
    });

    socket.on("subscribe_to_fleet", () => {
        socket.join("fleet_management");
        console.log(`Socket ${socket.id} subscribed to entire fleet`);
        
        // Send all known locations
        const allLocations = Array.from(vehicleLocationMap.values());
        socket.emit("fleet_init", allLocations);
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
    broadcastNotice,
    // Export mapping for persistence or other use cases
    vehicleLocationMap
};


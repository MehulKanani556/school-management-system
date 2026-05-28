let ioInstance;
const userSocketMap = new Map(); // userId -> socketId
const socketUserMap = new Map(); // socketId -> userId
const vehicleLocationMap = new Map(); // vehicleId -> { lat, lng, updatedAt }
const Message = require('../models/message.model');
const Vehicle = require('../models/vehicle.model');
const Driver = require('../models/driver.model');
const nc = require('../controllers/notification.controller');

function initializeSocket(io) {
  ioInstance = io;
  
  io.on("connection", (socket) => {
    console.log("New socket connection:", socket.id);

    // Register user when they connect
    socket.on("register_user", (data) => {
      // data can be just userId (string) or an object { userId, role, classId, classIds }
      const userId = typeof data === 'object' ? data.userId : data;
      const role = typeof data === 'object' ? data.role : null;
      const classId = typeof data === 'object' ? data.classId : null;
      const classIds = typeof data === 'object' ? data.classIds : [];

      if (userId) {
        const idStr = userId.toString();
        userSocketMap.set(idStr, socket.id);
        socketUserMap.set(socket.id, idStr);
        console.log(`[SOCKET] User ${idStr} registered to socket ${socket.id}`);
        
        // Join a private room for this user
        socket.join(idStr);
        console.log(`[SOCKET] User ${idStr} joined private room: ${idStr}`);

        // Join role room if provided
        if (role) {
            socket.join(`role_${role}`);
            console.log(`[SOCKET] User ${idStr} joined role room: role_${role}`);
        }

        // Join class rooms if provided
        const allClassIds = [...(classIds || [])];
        if (classId && !allClassIds.includes(classId)) allClassIds.push(classId);

        allClassIds.forEach(cid => {
            if (cid) {
                socket.join(`class_${cid}`);
                console.log(`User ${idStr} joined class room: class_${cid}`);
            }
        });
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

    socket.on("UPDATE_DRIVER_LOCATION", async (data) => {
        const { driverId, location, speed, heading, schoolId } = data;
        if (driverId && location) {
            const updatePayload = { 
                driverId, 
                lat: location.lat, 
                lng: location.lng, 
                speed, 
                heading, 
                updatedAt: new Date() 
            };
            
            // Try to find the vehicle assigned to this driver
            try {
                const driver = await Driver.findOne({ userId: driverId });
                if (driver) {
                    const vehicle = await Vehicle.findOne({ driverId: driver._id });
                    if (vehicle) {
                        const vehiclePayload = {
                            ...updatePayload,
                            vehicleId: vehicle._id.toString(),
                            registrationNumber: vehicle.registrationNumber
                        };
                        
                        // Broadcast to vehicle room (for Parents/Students)
                        io.to(`vehicle_${vehicle._id}`).emit("vehicle_location_updated", vehiclePayload);
                        
                        // Broadcast to fleet management (for Transporter)
                        io.to("fleet_management").emit("fleet_location_updated", vehiclePayload);
                        
                        // Update the internal map for caching
                        vehicleLocationMap.set(vehicle._id.toString(), vehiclePayload);
                    }
                }
            } catch (err) {
                console.error("Error finding vehicle for driver location update:", err);
            }

            // Always broadcast to driver-specific room
            io.to(`driver_${driverId}`).emit("driver_location_updated", updatePayload);
        }
    });

    socket.on("STOP_DRIVER_TRACKING", async (data) => {
        const { driverId } = data;
        if (driverId) {
            try {
                const driver = await Driver.findOne({ userId: driverId });
                if (driver) {
                    const vehicle = await Vehicle.findOne({ driverId: driver._id });
                    if (vehicle) {
                        const vehicleId = vehicle._id.toString();
                        vehicleLocationMap.delete(vehicleId);
                        
                        // Notify fleet management to remove or mark as offline
                        io.to("fleet_management").emit("fleet_location_removed", { vehicleId });
                        io.to(`vehicle_${vehicleId}`).emit("vehicle_location_offline", { vehicleId });
                    }
                }
            } catch (err) {
                console.error("Error stopping tracking for driver:", err);
            }
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

            // Transform data for frontend expectation if needed
            const frontendData = {
                ...populated.toJSON(),
                senderName: `${populated.sender.firstName} ${populated.sender.lastName}`
            };

            // Real-time send to recipient
            io.to(recipient.toString()).emit('NEW_MESSAGE', frontendData);
            // Send back to sender to confirm and update UI
            socket.emit('NEW_MESSAGE', frontendData);

            // Push a persistent system notification to the recipient
            nc.sendNotification({
                schoolId,
                recipient,
                sender: senderId,
                type: 'Message',
                title: `New Message from ${populated.sender.firstName} ${populated.sender.lastName}`,
                message: content.length > 60 ? content.substring(0, 60) + '...' : content,
                link: '/communication?tab=messages'
            }).catch(err => console.error("Error creating notification on DM socket event:", err));

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
  if (ioInstance) {
    ioInstance.to(userId.toString()).emit(event, data);
  }
};

const sendToClass = (classId, event, data) => {
    if (ioInstance && classId) {
        ioInstance.to(`class_${classId}`).emit(event, data);
    }
};

const broadcastToRole = (role, event, data) => {
  if (ioInstance) {
    if (role && role !== 'All') {
        ioInstance.to(`role_${role}`).emit(event, data);
    } else {
        ioInstance.emit(event, data);
    }
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
    sendToClass,
    broadcastToRole,
    broadcastNotice,
    // Export mapping for persistence or other use cases
    vehicleLocationMap
};


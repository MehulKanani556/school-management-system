require("dotenv").config();
const express = require('express');
const connectDb = require('./db/db');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/indexRoutes');
const { Server } = require("socket.io");
const socketManager = require("./socketManager/socketManager");
const { createServer } = require('node:http');
const app = express();
const port = process.env.PORT || 8000;

const server = createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
});

socketManager.initializeSocket(io);

connectDb(app);
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(bodyParser.json());
app.use('/api/', authRoutes);
app.listen(port, () => {
    console.log(`Server + Socket.IO is running on port ${port}`);
});

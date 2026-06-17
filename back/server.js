require("dotenv").config();

if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
    console.warn('[CONFIG] Cashfree credentials missing — parent online fee payments will return 503.');
}
if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
    console.warn('[CONFIG] Database URI not set (MONGO_URI or MONGODB_URI).');
}

const  dns = require("node:dns/promises");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
 
 

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
  allowedHeaders: ['Content-Type', 'Authorization', 'x-academic-year-id'],
  credentials: true,
}));
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
const subdomainResolver = require('./middleware/subdomain');
app.use(subdomainResolver);
const gpsRoutes = require('./routes/gps.routes');
app.use('/api/', authRoutes);
app.use('/api/gps', gpsRoutes);
server.listen(port, () => {
    console.log(`Server + Socket.IO is running on port ${port}`);
});

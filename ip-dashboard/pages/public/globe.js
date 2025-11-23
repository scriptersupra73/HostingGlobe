// globe.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Store detected IPs
let detectedIPs = [];

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle Socket.IO connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    // When a client sends IP data
    socket.on('ip-detected', (data) => {
        // Add timestamp
        data.timestamp = new Date().toISOString();
        data.socketId = socket.id;
        
        // Add to detected IPs
        detectedIPs.push(data);
        
        // Keep only last 100 entries
        if (detectedIPs.length > 100) {
            detectedIPs.shift();
        }
        
        // Broadcast to all clients
        io.emit('new-ip', data);
        console.log('New IP detected:', data);
    });
    
    // Send existing IPs to new client
    socket.emit('initial-ips', detectedIPs);
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Remove IPs from this socket
        detectedIPs = detectedIPs.filter(ip => ip.socketId !== socket.id);
        io.emit('ips-updated', detectedIPs);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

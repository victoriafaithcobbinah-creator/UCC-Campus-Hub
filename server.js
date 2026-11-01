import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Connects to your React app
    methods: ["GET", "POST"]
  }
});

// Store players
const players = new Map();

io.on('connection', (socket) => {
  console.log('A student connected:', socket.id);

  socket.on('join-campus', (data) => {
    socket.join('instance-1'); // Everyone goes to instance-1 for now
    
    const playerData = {
      id: socket.id,
      username: data.username || 'Student',
      x: data.x || 0,
      z: data.z || 0,
      instanceId: 'instance-1'
    };
    
    players.set(socket.id, playerData);

    // Send existing players to the new player
    const existingPlayers = Array.from(players.values()).filter(p => p.instanceId === 'instance-1' && p.id !== socket.id);
    socket.emit('current-players', existingPlayers);
    
    // Tell everyone else a new player joined
    socket.to('instance-1').emit('player-joined', playerData);
  });

  socket.on('player-move', (data) => {
    const player = players.get(socket.id);
    if (player) {
      player.x = data.x;
      player.z = data.z;
      // Send movement to everyone else in the instance
      socket.to(player.instanceId).emit('player-moved', { id: socket.id, x: player.x, z: player.z });
    }
  });

  socket.on('disconnect', () => {
    const player = players.get(socket.id);
    if (player) {
      players.delete(socket.id);
      socket.to(player.instanceId).emit('player-left', socket.id);
    }
    console.log('Student disconnected:', socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🎮 UCC Game Server running on port ${PORT}`);
});
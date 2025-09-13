import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET','POST'] }
});

const waitingQueue = [];
const rooms = new Map();

function makeRoomId() { return 'room_' + Math.random().toString(36).slice(2,8); }

io.on('connection', (socket) => {
  socket.on('requestMatch', (playerData) => {
    socket.data.name = playerData?.name || `Player_${socket.id.slice(0,4)}`;
    waitingQueue.push(socket);
    tryMatch();
  });

  socket.on('selectHero', ({ heroId }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    const room = rooms.get(roomId);
    const player = room.players.get(socket.id);
    if (player) {
      player.heroId = heroId;
      broadcastStatus(roomId);
      checkStart(roomId);
    }
  });

  socket.on('playerReady', () => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    const room = rooms.get(roomId);
    const player = room.players.get(socket.id);
    if (player) {
      player.isReady = true;
      broadcastStatus(roomId);
      checkStart(roomId);
    }
  });

  socket.on('confirmRules', () => {
  });

  socket.on('leaveRoom', () => leaveRoom(socket));
  socket.on('disconnect', () => leaveRoom(socket));
});

function tryMatch() {
  while (waitingQueue.length >= 2) {
    const a = waitingQueue.shift();
    const b = waitingQueue.shift();
    const roomId = makeRoomId();
    const room = { players: new Map() };
    rooms.set(roomId, room);
    [a,b].forEach(s => {
      s.join(roomId);
      s.data.roomId = roomId;
      room.players.set(s.id, { name: s.data.name, isReady: false, heroId: null });
    });
    broadcastStatus(roomId);
  }
}

function broadcastStatus(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  const players = Array.from(room.players.entries()).map(([sid, p]) => ({
    name: p.name,
    isReady: p.isReady,
    heroSelected: !!p.heroId
  }));
  const phase = getPhase(room);
  io.to(roomId).emit('roomStatusUpdate', { players, phase });
  if (phase === 'waiting_for_ready' && players.length === 2) {
    io.to(roomId).emit('proceedToRules', { gameRules: { mode: '1v1', win: 'KO' } });
  }
}

function getPhase(room) {
  const players = Array.from(room.players.values());
  if (players.length < 2) return 'waiting_for_opponent';
  const heroSelected = players.every(p => !!p.heroId);
  const ready = players.every(p => p.isReady);
  if (!heroSelected || !ready) return 'waiting_for_ready';
  return 'starting_game';
}

function checkStart(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  const players = Array.from(room.players.values());
  if (players.length !== 2) return;
  const heroSelected = players.every(p => !!p.heroId);
  const ready = players.every(p => p.isReady);
  if (heroSelected && ready) {
    io.to(roomId).emit('gameStarting', { countdown: 3 });
    setTimeout(() => {
      const payload = {
        players: players.map(p => ({ name: p.name, hero: { id: p.heroId } })),
        gameMode: '1v1'
      };
      io.to(roomId).emit('gameStart', payload);
    }, 3000);
  }
}

function leaveRoom(socket) {
  const roomId = socket.data.roomId;
  const idx = waitingQueue.indexOf(socket);
  if (idx >= 0) waitingQueue.splice(idx,1);
  if (roomId && rooms.has(roomId)) {
    const room = rooms.get(roomId);
    room.players.delete(socket.id);
    socket.leave(roomId);
    if (room.players.size === 0) {
      rooms.delete(roomId);
    } else {
      broadcastStatus(roomId);
    }
  }
  socket.data.roomId = null;
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Multiplayer server listening on ${PORT}`);
});

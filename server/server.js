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

const waitingQueue1v1 = [];
const waitingQueueTournament = [];
const rooms = new Map();

function makeRoomId(prefix='room') { return prefix + '_' + Math.random().toString(36).slice(2,8); }

io.on('connection', (socket) => {
  socket.on('requestMatch', (playerData) => {
    socket.data.name = playerData?.name || `Player_${socket.id.slice(0,4)}`;
    waitingQueue1v1.push(socket);
    tryMatch1v1();
  });

  socket.on('requestTournament', (playerData) => {
    socket.data.name = playerData?.name || `Player_${socket.id.slice(0,4)}`;
    waitingQueueTournament.push(socket);
    tryCreateTournament();
  });

  socket.on('updateName', ({ name }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    const room = rooms.get(roomId);
    const ps = room.players.get(socket.id);
    if (!ps) return;
    ps.name = name || ps.name;
    broadcastLobby(roomId);
  });

  socket.on('selectHero', ({ heroId }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    const room = rooms.get(roomId);
    const player = room.players.get(socket.id);
    if (player) {
      player.heroId = heroId;
      broadcastLobby(roomId);
      checkStart1v1(roomId);
      checkStartTournament(roomId);
    }
  });

  socket.on('playerReady', () => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    const room = rooms.get(roomId);
    const player = room.players.get(socket.id);
    if (player) {
      player.isReady = true;
      broadcastLobby(roomId);
      checkStart1v1(roomId);
      checkStartTournament(roomId);
    }
  });

  socket.on('clientBattleResult', (data) => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    const room = rooms.get(roomId);
    if (room.mode !== 'tournament') return;
    handleClientBattleResult(roomId, data);
  });

  socket.on('confirmRules', () => {});

  socket.on('leaveRoom', () => leaveRoom(socket));
  socket.on('disconnect', () => leaveRoom(socket));
});

function tryMatch1v1() {
  while (waitingQueue1v1.length >= 2) {
    const a = waitingQueue1v1.shift();
    const b = waitingQueue1v1.shift();
    const roomId = makeRoomId('duo');
    const room = { mode: '1v1', players: new Map() };
    rooms.set(roomId, room);
    [a,b].forEach(s => {
      s.join(roomId);
      s.data.roomId = roomId;
      room.players.set(s.id, { id: s.id, name: s.data.name, isReady: false, heroId: null });
    });
    broadcastRoomStatus1v1(roomId);
  }
}

function broadcastRoomStatus1v1(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  const players = Array.from(room.players.values()).map(p => ({
    name: p.name,
    isReady: p.isReady,
    heroSelected: !!p.heroId
  }));
  const phase = getPhase1v1(room);
  io.to(roomId).emit('roomStatusUpdate', { players, phase });
  if (phase === 'waiting_for_ready' && players.length === 2) {
    io.to(roomId).emit('proceedToRules', { gameRules: { mode: '1v1', win: 'KO' } });
  }
}

function getPhase1v1(room) {
  const players = Array.from(room.players.values());
  if (players.length < 2) return 'waiting_for_opponent';
  const heroSelected = players.every(p => !!p.heroId);
  const ready = players.every(p => p.isReady);
  if (!heroSelected || !ready) return 'waiting_for_ready';
  return 'starting_game';
}

function checkStart1v1(roomId) {
  const room = rooms.get(roomId);
  if (!room || room.mode !== '1v1') return;
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

function tryCreateTournament() {
  while (waitingQueueTournament.length >= 8) {
    const roomId = makeRoomId('t8');
    const room = {
      mode: 'tournament',
      players: new Map(),
      currentRound: 1,
      activePlayers: [],
      ghostPlayers: [],
      currentMatches: [],
      timer: null,
      phase: 'lobby'
    };
    rooms.set(roomId, room);
    for (let i = 0; i < 8; i++) {
      const s = waitingQueueTournament.shift();
      s.join(roomId);
      s.data.roomId = roomId;
      const ps = {
        sid: s.id,
        id: i + 1,
        name: s.data.name,
        heroId: null,
        isReady: false,
        hp: { current: 50, max: 50 },
        isEliminated: false,
        isGhost: false,
        wins: 0,
        losses: 0,
        gold: 300,
        consecutiveWins: 0,
        consecutiveLosses: 0
      };
      room.players.set(s.id, ps);
    }
    room.activePlayers = Array.from(room.players.values());
    broadcastLobby(roomId);
  }
}

function broadcastLobby(roomId) {
  const room = rooms.get(roomId);
  if (!room || room.mode !== 'tournament') return;
  const payload = {
    phase: room.phase,
    players: Array.from(room.players.values()).map(p => ({
      id: p.id,
      name: p.name,
      isReady: !!p.isReady,
      heroSelected: !!p.heroId
    }))
  };
  io.to(roomId).emit('lobbyUpdate', payload);
}

function checkStartTournament(roomId) {
  const room = rooms.get(roomId);
  if (!room || room.mode !== 'tournament') return;
  const players = Array.from(room.players.values());
  if (players.length !== 8) return;
  const heroSelected = players.every(p => !!p.heroId);
  const ready = players.every(p => p.isReady);
  if (heroSelected && ready && room.phase === 'lobby') {
    room.phase = 'buffer';
    io.to(roomId).emit('tournamentStart', {});
    startBuffer(roomId);
  }
}

function startBuffer(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  room.phase = 'buffer';
  let time = 30;
  broadcastRoundState(roomId, { phase: 'buffer', time });
  room.timer && clearInterval(room.timer);
  room.timer = setInterval(() => {
    time--;
    broadcastRoundState(roomId, { phase: 'buffer', time });
    if (time <= 0) {
      clearInterval(room.timer);
      startRound(roomId);
    }
  }, 1000);
}

function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }

function generateMatches(room) {
  const shuffled = shuffle([...room.activePlayers.filter(p => !p.isGhost)]);
  if (shuffled.length % 2 === 1 && room.ghostPlayers.length > 0) {
    const randomGhost = room.ghostPlayers[Math.floor(Math.random() * room.ghostPlayers.length)];
    shuffled.push(randomGhost);
  }
  const matches = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    if (shuffled[i + 1]) {
      matches.push({
        matchId: 'm_' + Math.random().toString(36).slice(2,8),
        player1Id: shuffled[i].id,
        player2Id: shuffled[i+1].id,
        completed: false,
        winnerId: null
      });
    }
  }
  return matches;
}

function broadcastRoundState(roomId, extra) {
  const room = rooms.get(roomId);
  if (!room) return;
  const state = {
    phase: extra.phase || room.phase,
    time: extra.time != null ? extra.time : 0,
    roundNumber: room.currentRound,
    activeCount: room.activePlayers.filter(p => !p.isEliminated && !p.isGhost).length,
    ghostCount: room.ghostPlayers.length,
    damageMultiplier: extra.damageMultiplier || 1,
    players: Array.from(room.players.values()).map(p => ({
      id: p.id,
      name: p.name,
      heroId: p.heroId,
      hp: p.hp,
      isEliminated: p.isEliminated,
      isGhost: p.isGhost,
      wins: p.wins,
      losses: p.losses,
      gold: p.gold
    }))
  };
  io.to(roomId).emit('roundState', state);
}

function findById(room, id) {
  return Array.from(room.players.values()).find(p => p.id === id) ||
         room.ghostPlayers.find(g => g.id === id);
}

function startRound(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  room.phase = 'round';
  room.currentMatches = generateMatches(room);
  let time = 50;
  let damageMultiplier = 1;
  broadcastRoundState(roomId, { phase: 'round', time, damageMultiplier });
  io.to(roomId).emit('matches', { matches: room.currentMatches });

  room.currentMatches.forEach(m => {
    const p1 = findById(room, m.player1Id);
    const p2 = findById(room, m.player2Id);
    const s1 = Array.from(room.players.entries()).find(([sid, p]) => p.id === p1.id);
    const s2 = Array.from(room.players.entries()).find(([sid, p]) => p.id === p2.id);
    if (p1 && p2) {
      if (!p1.isGhost && s1) {
        io.to(s1[0]).emit('matchAssign', { matchId: m.matchId, me: { id: p1.id, heroId: p1.heroId }, opponent: { id: p2.id, heroId: p2.heroId }, myGold: p1.gold });
      }
      if (!p2.isGhost && s2) {
        io.to(s2[0]).emit('matchAssign', { matchId: m.matchId, me: { id: p2.id, heroId: p2.heroId }, opponent: { id: p1.id, heroId: p1.heroId }, myGold: p2.gold });
      }
      if (p1.isGhost || p2.isGhost) {
        const winner = Math.random() < 0.5 ? p1 : p2;
        finalizeMatch(roomId, m.matchId, winner.id, 5);
      }
    }
  });

  room.timer && clearInterval(room.timer);
  room.timer = setInterval(() => {
    time--;
    const secondsElapsed = 50 - time;
    damageMultiplier = secondsElapsed >= 20 ? 1 + (0.06 * (secondsElapsed - 20)) : 1;
    broadcastRoundState(roomId, { phase: 'round', time, damageMultiplier });
    if (time <= 0) {
      clearInterval(room.timer);
      room.currentMatches.filter(mx => !mx.completed).forEach(mx => {
        const p1 = findById(room, mx.player1Id);
        const p2 = findById(room, mx.player2Id);
        const winner = Math.random() < 0.5 ? p1 : p2;
        finalizeMatch(roomId, mx.matchId, winner.id, 5);
      });
      maybeCompleteRound(roomId);
    }
  }, 1000);
}

function handleClientBattleResult(roomId, data) {
  const room = rooms.get(roomId);
  if (!room) return;
  const mx = room.currentMatches.find(m => m.matchId === data.matchId);
  if (!mx || mx.completed) return;
  finalizeMatch(roomId, data.matchId, data.winnerId, data.hpLost || 5);
  maybeCompleteRound(roomId);
}

function awardEconomy(winner, loser, hpLost) {
  winner.wins = (winner.wins || 0) + 1;
  winner.consecutiveWins = (winner.consecutiveWins || 0) + 1;
  winner.consecutiveLosses = 0;
  let winReward = 250 + 50 + Math.min((winner.consecutiveWins - 1) * 25, 150);
  winner.gold = (winner.gold || 0) + winReward;

  loser.consecutiveLosses = (loser.consecutiveLosses || 0) + 1;
  loser.consecutiveWins = 0;
  const lossReward = 250 + (hpLost * 20) + Math.min((loser.consecutiveLosses - 1) * 20, 150);
  loser.gold = (loser.gold || 0) + lossReward;
}

function finalizeMatch(roomId, matchId, winnerId, hpLost) {
  const room = rooms.get(roomId);
  if (!room) return;
  const mx = room.currentMatches.find(m => m.matchId === matchId);
  if (!mx || mx.completed) return;
  const p1 = findById(room, mx.player1Id);
  const p2 = findById(room, mx.player2Id);
  const winner = winnerId === p1.id ? p1 : p2;
  const loser = winnerId === p1.id ? p2 : p1;
  loser.losses = (loser.losses || 0) + 1;
  loser.hp.current = Math.max(0, loser.hp.current - hpLost);
  awardEconomy(winner, loser, hpLost);
  mx.completed = true;
  mx.winnerId = winner.id;
}

function maybeCompleteRound(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  const allDone = room.currentMatches.every(m => m.completed);
  if (!allDone) return;
  room.activePlayers = room.activePlayers.filter(p => p.hp.current > 0 || p.isGhost);
  const newlyEliminated = room.activePlayers.filter(p => !p.isGhost && p.hp.current <= 0 && !p.isEliminated);
  newlyEliminated.forEach(player => {
    player.isEliminated = true;
    const ghost = {
      ...player,
      name: `👻 Ghost of ${player.name.replace('👻 Ghost of ', '')}`,
      isGhost: true,
      hp: { current: 0, max: 50 },
      losses: 0
    };
    room.ghostPlayers.push(ghost);
  });
  room.activePlayers = room.activePlayers.filter(p => !p.isEliminated || p.isGhost);
  if (room.activePlayers.filter(p => !p.isGhost).length > 1) {
    const payload = {
      roundNumber: room.currentRound,
      activeCount: room.activePlayers.filter(p => !p.isGhost).length,
      ghostCount: room.ghostPlayers.length,
      nextBuffer: 30,
      players: Array.from(room.players.values()).map(p => ({
        id: p.id, name: p.name, heroId: p.heroId, hp: p.hp, isEliminated: p.isEliminated, isGhost: p.isGhost, wins: p.wins, losses: p.losses, gold: p.gold
      }))
    };
    io.to(roomId).emit('roundComplete', payload);
    room.currentRound += 1;
    startBuffer(roomId);
  } else {
    const winner = room.activePlayers.find(p => !p.isGhost && !p.isEliminated) || Array.from(room.players.values()).find(p => !p.isGhost);
    io.to(roomId).emit('tournamentEnd', { winner: { id: winner.id, name: winner.name } });
    cleanupRoom(roomId);
  }
}

function cleanupRoom(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  if (room.timer) clearInterval(room.timer);
  rooms.delete(roomId);
}

function leaveRoom(socket) {
  const roomId = socket.data.roomId;
  const i1 = waitingQueue1v1.indexOf(socket);
  if (i1 >= 0) waitingQueue1v1.splice(i1,1);
  const i2 = waitingQueueTournament.indexOf(socket);
  if (i2 >= 0) waitingQueueTournament.splice(i2,1);
  if (roomId && rooms.has(roomId)) {
    const room = rooms.get(roomId);
    room.players.delete(socket.id);
    socket.leave(roomId);
    if (room.players.size === 0) {
      cleanupRoom(roomId);
    } else {
      if (room.mode === '1v1') broadcastRoomStatus1v1(roomId);
      if (room.mode === 'tournament') broadcastLobby(roomId);
    }
  }
  socket.data.roomId = null;
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Multiplayer server listening on ${PORT}`);
});

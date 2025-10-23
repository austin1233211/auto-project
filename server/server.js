import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({
  origin: (origin, callback) => {
    const allowlist = [
      'http://localhost:8080',
      'https://game-test-app-t0805w30.devinapps.com',
      'https://auto-project-production.up.railway.app',
      process.env.CLIENT_ORIGIN,
      process.env.DEPLOY_ORIGIN
    ].filter(Boolean);
    if (!origin || allowlist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Auto Gladiators Server is running' });
});

const clientRoot = path.resolve(__dirname, '..');
app.use(express.static(clientRoot));
try { console.log('[startup] Serving static from', clientRoot); } catch(_) {}
try { 
  const allowed = [
    'http://localhost:8080',
    'https://game-test-app-t0805w30.devinapps.com',
    'https://auto-project-production.up.railway.app',
    process.env.CLIENT_ORIGIN,
    process.env.DEPLOY_ORIGIN
  ].filter(Boolean);
  console.log('[startup] Allowed origins:', allowed);
} catch(_) {}
app.get('*', (req, res) => {
  res.sendFile(path.join(clientRoot, 'index.html'));
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const allowlist = [
        'http://localhost:8080',
        'https://game-test-app-t0805w30.devinapps.com',
        'https://auto-project-production.up.railway.app',
        process.env.CLIENT_ORIGIN,
        process.env.DEPLOY_ORIGIN
      ].filter(Boolean);
      if (!origin || allowlist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET','POST'],
    credentials: true
  }
});

const waitingQueue1v1 = [];
const waitingQueueTournament = [];
const rooms = new Map();

function makeRoomId(prefix='room') { return prefix + '_' + Math.random().toString(36).slice(2,8); }

function sanitizePlayerName(name) {
  if (!name || typeof name !== 'string') {
    return `Player_${Math.floor(Math.random()*100000)}`;
  }
  return name
    .replace(/<[^>]*>/g, '')
    .replace(/[<>'"]/g, '')
    .trim()
    .substring(0, 20) || `Player_${Math.floor(Math.random()*100000)}`;
}

io.on('connection', (socket) => {
  console.log('New WebSocket connection established:', socket.id, new Date().toISOString());
  
  socket.on('requestMatch', (playerData) => {
    console.log('[1v1] requestMatch from', socket.id, 'name=', playerData?.name, 'existingRoom=', socket.data?.roomId);
    socket.data.name = sanitizePlayerName(playerData?.name);
    if (socket.data.roomId) {
      leaveRoom(socket);
    }

    let joinedExistingDuo = false;
    for (const [roomId, room] of rooms.entries()) {
      if (room.mode === '1v1' && room.phase === 'lobby' && room.players.size === 1) {
        console.log('[1v1] Joining existing duo room:', roomId);
        socket.join(roomId);
        socket.data.roomId = roomId;
        const idx = room.players.size + 1;
        room.players.set(socket.id, {
          sid: socket.id,
          id: idx,
          name: socket.data.name,
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
        });
        joinedExistingDuo = true;
        broadcastRoomStatus1v1(roomId);
        break;
      }
    }

    if (!joinedExistingDuo) {
      waitingQueue1v1.push(socket);
      for (let i = waitingQueue1v1.length - 1; i >= 0; i--) {
        if (!waitingQueue1v1[i]?.connected) waitingQueue1v1.splice(i, 1);
      }
      console.log('[1v1] queue now =', waitingQueue1v1.map(s => s.id));

      if (waitingQueue1v1.length >= 2) {
        const a = waitingQueue1v1.shift();
        const b = waitingQueue1v1.shift();
        if (a && b && a.connected && b.connected) {
          const roomId = makeRoomId('duo');
          const room = {
            mode: '1v1',
            players: new Map(),
            currentRound: 1,
            activePlayers: [],
            ghostPlayers: [],
            currentMatches: [],
            timer: null,
            phase: 'lobby'
          };
          rooms.set(roomId, room);
          [a,b].forEach((s, idx) => {
            s.join(roomId);
            s.data.roomId = roomId;
            room.players.set(s.id, {
              sid: s.id,
              id: idx + 1,
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
            });
          });
          console.log('[1v1] Created room', roomId, 'players=', Array.from(room.players.values()).map(p => ({name:p.name, ready:p.isReady, heroId:p.heroId})));
          broadcastRoomStatus1v1(roomId);
        }
      } else {
        console.log('[1v1] waiting for opponent; queue length =', waitingQueue1v1.length);
      }
    }
  });

  socket.on('requestTournament', (playerData) => {
    console.log('Tournament request received from:', socket.id, playerData);
    socket.data.name = sanitizePlayerName(playerData?.name);
    
    let joinedExistingRoom = false;
    for (const [roomId, room] of rooms.entries()) {
      if (room.mode === 'tournament' && room.phase === 'waiting' && room.players.size < 8) {
        console.log('Adding player to existing waiting room:', roomId);
        socket.join(roomId);
        socket.data.roomId = roomId;
        const ps = {
          sid: socket.id,
          id: room.players.size + 1,
          name: socket.data.name,
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
        room.players.set(socket.id, ps);
        broadcastWaitingRoom(roomId);
        joinedExistingRoom = true;
        break;
      }
    }
    
    if (!joinedExistingRoom) {
      console.log('No existing waiting room found, creating new one');
      createWaitingRoom(socket);
    }
  });

  socket.on('updateName', ({ name }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    const room = rooms.get(roomId);
    const ps = room.players.get(socket.id);
    if (!ps) return;
    ps.name = sanitizePlayerName(name) || ps.name;
    broadcastLobby(roomId);
  });

  socket.on('selectHero', ({ heroId }) => {
    const roomId = socket.data.roomId;
    console.log('[1v1] selectHero from', socket.id, 'room=', roomId, 'heroId=', heroId);
    if (!roomId || !rooms.has(roomId)) return;
    if (!heroId || typeof heroId !== 'string') {
      console.log('[1v1] selectHero invalid heroId:', heroId);
      return;
    }
    const room = rooms.get(roomId);
    const player = room.players.get(socket.id);
    if (!player) {
      console.log('[1v1] selectHero could not find player for socket', socket.id, 'players keys=', Array.from(room.players.keys()));
      return;
    }
    const before = { heroId: player.heroId, isReady: player.isReady, name: player.name };
    player.heroId = heroId;
    const after = { heroId: player.heroId, isReady: player.isReady, name: player.name };
    console.log('[1v1] selectHero updated', before, '->', after);
    if (room.mode === '1v1') {
      broadcastRoomStatus1v1(roomId);
      checkStart1v1(roomId);
    } else {
      broadcastLobby(roomId);
      checkStartTournament(roomId);
    }
  });

  socket.on('playerReady', () => {
    const roomId = socket.data.roomId;
    console.log('[1v1] playerReady from', socket.id, 'room=', roomId);
    if (!roomId || !rooms.has(roomId)) return;
    const room = rooms.get(roomId);
    const player = room.players.get(socket.id);
    if (!player) {
      console.log('[1v1] playerReady could not find player for socket', socket.id, 'players keys=', Array.from(room.players.keys()));
      return;
    }
    const before = { heroId: player.heroId, isReady: player.isReady, name: player.name };
    player.isReady = true;
    const after = { heroId: player.heroId, isReady: player.isReady, name: player.name };
    console.log('[1v1] playerReady updated', before, '->', after);
    if (room.mode === '1v1') {
      broadcastRoomStatus1v1(roomId);
      checkStart1v1(roomId);
    } else {
      broadcastLobby(roomId);
      checkStartTournament(roomId);
    }
  });

  socket.on('clientBattleResult', (data) => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    const room = rooms.get(roomId);
    if (room.mode !== 'tournament' && room.mode !== '1v1') return;
    handleClientBattleResult(roomId, data);
  });

  socket.on('confirmRules', () => {});

  socket.on('leaveRoom', () => { leaveRoom(socket); broadcastQueueStatusTournament(); });
  socket.on('disconnect', () => { leaveRoom(socket); broadcastQueueStatusTournament(); });
});

function tryMatch1v1() {
  console.log('[1v1] tryMatch1v1 called. queue length =', waitingQueue1v1.length);
  while (waitingQueue1v1.length >= 2) {
    let a = waitingQueue1v1.shift();
    let b = waitingQueue1v1.shift();
    if (!a?.connected) a = null;
    if (!b?.connected) b = null;
    if (!a || !b) {
      console.log('[1v1] skipped pairing due to disconnected socket(s)');
      continue;
    }
    const roomId = makeRoomId('duo');
    const room = {
      mode: '1v1',
      players: new Map(),
      currentRound: 1,
      activePlayers: [],
      ghostPlayers: [],
      currentMatches: [],
      timer: null,
      phase: 'lobby'
    };
    rooms.set(roomId, room);
    [a,b].forEach((s, idx) => {
      s.join(roomId);
      s.data.roomId = roomId;
      room.players.set(s.id, {
        sid: s.id,
        id: idx + 1,
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
      });
    });
    console.log('[1v1] Created room', roomId, 'players=', Array.from(room.players.values()).map(p => ({name:p.name, ready:p.isReady, heroId:p.heroId})));
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
  console.log('[1v1]', roomId, 'broadcast status phase=', phase, players);
  io.to(roomId).emit('roomStatusUpdate', { players, phase });
  if (players.length === 2) {
    const allHeroes = players.every(p => p.heroSelected);
    const allReady = players.every(p => p.isReady);
    if (allHeroes && !allReady) {
      console.log('[1v1]', roomId, 'proceedToRules');
      io.to(roomId).emit('proceedToRules', { gameRules: { mode: '1v1', win: 'KO' } });
    }
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
function broadcastQueueStatusTournament() {
  const payload = { mode: 'tournament', queued: waitingQueueTournament.length, needed: 8 };
  waitingQueueTournament.forEach(s => {
    s.emit('queueStatus', payload);
  });
}

function checkStart1v1(roomId) {
  const room = rooms.get(roomId);
  if (!room || room.mode !== '1v1') return;
  const players = Array.from(room.players.values());
  if (players.length !== 2) return;
  const heroSelected = players.every(p => !!p.heroId);
  const ready = players.every(p => p.isReady);
  console.log('[1v1]', roomId, 'checkStart heroSelected=', heroSelected, 'ready=', ready, players.map(p => ({name:p.name, ready:p.isReady, heroId:p.heroId})));
  if (heroSelected && ready) {
    console.log('[1v1]', roomId, 'EMIT gameStarting then start buffer/round lifecycle');
    io.to(roomId).emit('gameStarting', { countdown: 3 });
    setTimeout(() => {
      const pArr = Array.from(room.players.values());
      room.activePlayers = pArr.map(p => ({
        id: p.id,
        name: p.name,
        heroId: p.heroId,
        hp: p.hp,
        isEliminated: p.isEliminated,
        isGhost: p.isGhost,
        wins: p.wins || 0,
        losses: p.losses || 0,
        gold: p.gold || 300
      }));
      room.ghostPlayers = [];
      room.currentRound = 1;
      room.phase = 'buffer';
      startBuffer(roomId);
    }, 3000);
  }
}

function createWaitingRoom(socket) {
  const roomId = makeRoomId('t8');
  const room = {
    mode: 'tournament',
    players: new Map(),
    currentRound: 1,
    activePlayers: [],
    ghostPlayers: [],
    currentMatches: [],
    timer: null,
    phase: 'waiting'
  };
  rooms.set(roomId, room);
  
  socket.join(roomId);
  socket.data.roomId = roomId;
  const ps = {
    sid: socket.id,
    id: 1,
    name: socket.data.name,
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
  room.players.set(socket.id, ps);
  
  console.log('Created new waiting room:', roomId, 'with first player:', socket.data.name);
  broadcastWaitingRoom(roomId);
}

function tryCreateTournament() {
  console.log('tryCreateTournament called but no longer needed');
}

function broadcastWaitingRoom(roomId) {
  console.log('broadcastWaitingRoom called for room:', roomId);
  const room = rooms.get(roomId);
  if (!room || room.mode !== 'tournament') {
    console.log('Room not found or not tournament mode:', room?.mode);
    return;
  }
  const playerCount = room.players.size;
  const payload = {
    phase: 'waiting',
    playerCount: playerCount,
    maxPlayers: 8,
    players: Array.from(room.players.values()).map(p => ({
      id: p.id,
      name: p.name
    }))
  };
  console.log('Broadcasting waitingRoomUpdate with payload:', payload);
  io.to(roomId).emit('waitingRoomUpdate', payload);
  
  if (playerCount === 8 && !room.startCountdownTimer) {
    console.log('Starting countdown timer for 8 players');
    room.startCountdownTimer = setTimeout(() => {
      room.phase = 'lobby';
      broadcastLobby(roomId);
      io.to(roomId).emit('startHeroSelection', {});
    }, 10000); // 10 second countdown
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

  if (room.phase !== 'lobby') return;

  if (heroSelected && ready) {
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
  if (room.lobbyAutoStartTimer) {
    clearTimeout(room.lobbyAutoStartTimer);
    room.lobbyAutoStartTimer = null;
  }
  if (room.lobbyHeroAutoSelectTimer) {
    clearTimeout(room.lobbyHeroAutoSelectTimer);
    room.lobbyHeroAutoSelectTimer = null;
  }
  if (room.startCountdownTimer) {
    clearTimeout(room.startCountdownTimer);
    room.startCountdownTimer = null;
  }
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
      if (room.mode === 'tournament') {
        broadcastLobby(roomId);
        checkStartTournament(roomId);
      }
    }
  }
  socket.data.roomId = null;
}

const PORT = process.env.SERVER_PORT || process.env.PORT || 3001;
try { console.log('[startup] Will listen on PORT', PORT, '(SERVER_PORT preferred if set)'); } catch(_) {}
if (!server.listening) {
  server.listen(PORT, () => {
    console.log(`Multiplayer server listening on ${PORT}`);
  });
} else {
  console.log('Server already listening, skipping duplicate listen()');
}

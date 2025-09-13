const jwt = require('jsonwebtoken');
const Tournament = require('../models/Tournament');
const TournamentService = require('../services/TournamentService');
const CombatService = require('../services/CombatService');

const connectedClients = new Map();
const tournamentRooms = new Map();

function websocketHandler(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.player = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`Player ${socket.player.username} connected`);
    connectedClients.set(socket.player.playerId, socket);
    
    socket.on('join_tournament', async (data) => {
      try {
        const { tournamentId } = data;
        
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
          socket.emit('error', { message: 'Tournament not found' });
          return;
        }
        
        const players = await Tournament.getPlayers(tournamentId);
        const isParticipant = players.some(p => p.player_id === socket.player.playerId);
        
        if (!isParticipant) {
          socket.emit('error', { message: 'Not participating in this tournament' });
          return;
        }
        
        socket.join(`tournament_${tournamentId}`);
        
        if (!tournamentRooms.has(tournamentId)) {
          tournamentRooms.set(tournamentId, new Set());
        }
        tournamentRooms.get(tournamentId).add(socket.player.playerId);
        
        const tournamentState = await TournamentService.getTournamentState(tournamentId);
        socket.emit('tournament_state', {
          tournament: tournamentState.tournament,
          players: tournamentState.players,
          currentMatches: tournamentState.currentMatches,
          activePlayers: tournamentState.activePlayers,
          eliminatedPlayers: tournamentState.eliminatedPlayers
        });
        
        socket.to(`tournament_${tournamentId}`).emit('player_joined', {
          playerId: socket.player.playerId,
          username: socket.player.username
        });
        
      } catch (error) {
        console.error('Join tournament error:', error);
        socket.emit('error', { message: 'Failed to join tournament' });
      }
    });
    
    socket.on('start_battle', async (data) => {
      try {
        const { matchId } = data;
        
        const match = await require('../models/Match').findById(matchId);
        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }
        
        socket.to(`tournament_${match.tournament_id}`).emit('battle_started', {
          matchId,
          player1: match.player1_username,
          player2: match.player2_username
        });
        
        const result = await CombatService.simulateBattle(match);
        
        io.to(`tournament_${match.tournament_id}`).emit('battle_completed', {
          matchId,
          result,
          winner: result.winnerId === match.player1_id ? match.player1_username : match.player2_username
        });
        
      } catch (error) {
        console.error('Start battle error:', error);
        socket.emit('error', { message: 'Failed to start battle' });
      }
    });
    
    socket.on('round_timer_update', (data) => {
      const { tournamentId, timeRemaining } = data;
      socket.to(`tournament_${tournamentId}`).emit('timer_update', {
        timeRemaining,
        type: 'round_timer'
      });
    });
    
    socket.on('purchase_ability', async (data) => {
      try {
        const { tournamentId, abilityId } = data;
        
        socket.to(`tournament_${tournamentId}`).emit('player_purchase', {
          playerId: socket.player.playerId,
          username: socket.player.username,
          abilityId
        });
        
      } catch (error) {
        console.error('Purchase ability broadcast error:', error);
      }
    });
    
    socket.on('leave_tournament', (data) => {
      const { tournamentId } = data;
      socket.leave(`tournament_${tournamentId}`);
      
      if (tournamentRooms.has(tournamentId)) {
        tournamentRooms.get(tournamentId).delete(socket.player.playerId);
        if (tournamentRooms.get(tournamentId).size === 0) {
          tournamentRooms.delete(tournamentId);
        }
      }
      
      socket.to(`tournament_${tournamentId}`).emit('player_left', {
        playerId: socket.player.playerId,
        username: socket.player.username
      });
    });
    
    socket.on('disconnect', () => {
      console.log(`Player ${socket.player.username} disconnected`);
      connectedClients.delete(socket.player.playerId);
      
      for (const [tournamentId, playerSet] of tournamentRooms.entries()) {
        if (playerSet.has(socket.player.playerId)) {
          playerSet.delete(socket.player.playerId);
          socket.to(`tournament_${tournamentId}`).emit('player_disconnected', {
            playerId: socket.player.playerId,
            username: socket.player.username
          });
          
          if (playerSet.size === 0) {
            tournamentRooms.delete(tournamentId);
          }
        }
      }
    });
  });
  
  setInterval(() => {
    broadcastTournamentUpdates();
  }, 5000);
}

async function broadcastTournamentUpdates() {
  for (const tournamentId of tournamentRooms.keys()) {
    try {
      const tournamentState = await TournamentService.getTournamentState(tournamentId);
      
      if (tournamentState.tournament.status === 'active') {
        const io = require('../server').io;
        io.to(`tournament_${tournamentId}`).emit('tournament_update', {
          tournament: tournamentState.tournament,
          players: tournamentState.players,
          currentMatches: tournamentState.currentMatches,
          activePlayers: tournamentState.activePlayers,
          eliminatedPlayers: tournamentState.eliminatedPlayers
        });
      }
    } catch (error) {
      console.error(`Error broadcasting updates for tournament ${tournamentId}:`, error);
    }
  }
}

module.exports = websocketHandler;

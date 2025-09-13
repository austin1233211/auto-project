const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const EconomyService = require('./EconomyService');

class TournamentService {
  static async startTournament(tournamentId) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament || tournament.status !== 'waiting') {
      throw new Error('Tournament cannot be started');
    }
    
    const players = await Tournament.getPlayers(tournamentId);
    if (players.length < 2) {
      throw new Error('Not enough players to start tournament');
    }
    
    await Tournament.updateStatus(tournamentId, 'active');
    await this.generateRoundMatches(tournamentId, 1, players);
    
    return tournament;
  }
  
  static async generateRoundMatches(tournamentId, roundNumber, players) {
    const activePlayers = players.filter(p => !p.is_eliminated);
    const matches = [];
    
    const shuffledPlayers = [...activePlayers].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < shuffledPlayers.length; i += 2) {
      if (i + 1 < shuffledPlayers.length) {
        const match = await Match.create({
          tournamentId,
          roundNumber,
          player1Id: shuffledPlayers[i].id,
          player2Id: shuffledPlayers[i + 1].id
        });
        matches.push(match);
      } else {
        matches.push({
          tournamentId,
          roundNumber,
          player1Id: shuffledPlayers[i].id,
          player2Id: null,
          bye: true
        });
      }
    }
    
    return matches;
  }
  
  static async processRoundResults(tournamentId, roundNumber) {
    const matches = await Match.findByTournamentRound(tournamentId, roundNumber);
    const players = await Tournament.getPlayers(tournamentId);
    
    for (const match of matches) {
      if (match.status === 'completed' && match.winner_id) {
        const winner = players.find(p => p.id === match.winner_id);
        const loser = players.find(p => 
          p.id === (match.player1_id === match.winner_id ? match.player2_id : match.player1_id)
        );
        
        if (winner && loser) {
          await this.updatePlayerAfterBattle(winner, true, match);
          await this.updatePlayerAfterBattle(loser, false, match);
        }
      }
    }
    
    const activePlayers = players.filter(p => !p.is_eliminated && p.current_health > 0);
    
    if (activePlayers.length <= 1) {
      await Tournament.updateStatus(tournamentId, 'completed');
      return { tournamentComplete: true, winner: activePlayers[0] };
    }
    
    const nextRound = roundNumber + 1;
    await Tournament.updateRound(tournamentId, nextRound);
    await this.generateRoundMatches(tournamentId, nextRound, activePlayers);
    
    return { tournamentComplete: false, nextRound };
  }
  
  static async updatePlayerAfterBattle(tournamentPlayer, isWin, match) {
    const pool = require('../config/database');
    
    const healthLoss = isWin ? 0 : EconomyService.calculateHealthLoss(
      isWin ? match.player1_health_lost : match.player2_health_lost,
      match.round_number
    );
    
    const newHealth = Math.max(0, tournamentPlayer.current_health - healthLoss);
    const goldReward = EconomyService.calculateBattleReward(
      isWin,
      isWin ? tournamentPlayer.consecutive_wins : tournamentPlayer.consecutive_losses
    );
    
    const newWins = isWin ? tournamentPlayer.consecutive_wins + 1 : 0;
    const newLosses = isWin ? 0 : tournamentPlayer.consecutive_losses + 1;
    
    const query = `
      UPDATE tournament_players 
      SET current_health = $1,
          gold = gold + $2,
          consecutive_wins = $3,
          consecutive_losses = $4,
          rounds_played = rounds_played + 1,
          is_eliminated = $5
      WHERE id = $6
      RETURNING *
    `;
    
    const isEliminated = newHealth <= 0;
    
    const result = await pool.query(query, [
      newHealth,
      goldReward,
      newWins,
      newLosses,
      isEliminated,
      tournamentPlayer.id
    ]);
    
    if (isEliminated) {
      const remainingPlayers = await pool.query(
        'SELECT COUNT(*) as count FROM tournament_players WHERE tournament_id = $1 AND is_eliminated = false',
        [tournamentPlayer.tournament_id]
      );
      
      const placement = parseInt(remainingPlayers.rows[0].count) + 1;
      await Tournament.eliminatePlayer(tournamentPlayer.id, placement);
    }
    
    return result.rows[0];
  }
  
  static async getTournamentState(tournamentId) {
    const tournament = await Tournament.findById(tournamentId);
    const players = await Tournament.getPlayers(tournamentId);
    const currentMatches = await Match.findByTournamentRound(tournamentId, tournament.current_round);
    
    return {
      tournament,
      players,
      currentMatches,
      activePlayers: players.filter(p => !p.is_eliminated),
      eliminatedPlayers: players.filter(p => p.is_eliminated).sort((a, b) => a.placement - b.placement)
    };
  }
}

module.exports = TournamentService;

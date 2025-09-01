import { heroes } from './heroes.js';
import { IsolatedCombat } from './isolated-combat.js';
import { TournamentClient } from './tournament-client.js';
import { WebSocketClient } from './websocket-client.js';
import { MatchmakingManager } from './matchmaking-manager.js';

export class RoundsManager {
  constructor(container) {
    this.container = container;
    this.tournamentClient = new TournamentClient();
    this.websocketClient = new WebSocketClient();
    this.matchmakingManager = new MatchmakingManager(this.container);
    this.currentTournament = null;
    this.playerParticipant = null;
    this.tournamentState = null;
    this.onTournamentEnd = null;
    this.isolatedCombat = new IsolatedCombat(this.container);
    this.userHero = null;
    this.playerId = null;
    this.isInBattle = false;
    this.currentState = 'idle';
  }

  async init(userHero = null) {
    this.userHero = userHero;
    this.playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.currentState = 'matchmaking';
    
    this.setupMatchmakingCallbacks();
    this.matchmakingManager.startMatchmaking();
    this.matchmakingManager.updateStatus('🔍 Looking for tournament...');
    
    try {
      const tournaments = await this.tournamentClient.listTournaments('waiting');
      
      if (tournaments.length > 0) {
        this.currentTournament = tournaments[0];
        await this.joinTournament();
      } else {
        await this.createTournament();
      }
      
      await this.connectWebSocket();
      
    } catch (error) {
      console.error('Failed to initialize tournament:', error);
      this.matchmakingManager.showError('Failed to join tournament. Using local mode.');
      setTimeout(() => {
        this.fallbackToLocalMode();
      }, 2000);
    }
  }

  async createTournament() {
    const tournamentData = {
      name: `Tournament ${Date.now()}`,
      max_players: 8,
      entry_fee: 0,
      tournament_type: 'elimination'
    };
    
    this.currentTournament = await this.tournamentClient.createTournament(tournamentData);
    await this.joinTournament();
  }

  async joinTournament() {
    this.playerParticipant = await this.tournamentClient.joinTournament(
      this.currentTournament.id, 
      this.userHero.id,
      this.playerId
    );
    
    this.playerId = this.playerParticipant.player_id;
  }

  async connectWebSocket() {
    this.websocketClient.setOnConnect(() => {
      console.log('Connected to tournament WebSocket');
      this.websocketClient.requestBracket();
    });

    this.websocketClient.setOnTournamentUpdate((data) => {
      this.tournamentState = data;
      this.updateTournamentDisplay();
    });

    this.websocketClient.setOnMatchUpdate((data) => {
      if (this.isPlayerInMatch(data)) {
        this.startPlayerBattle(data);
      }
    });

    this.websocketClient.setOnReadyCheck((data) => {
      this.matchmakingManager.startReadyCheck(data.timeLimit || 10);
    });

    this.websocketClient.setOnReadyCheckComplete((data) => {
      this.matchmakingManager.endReadyCheck();
      if (data.success) {
        this.currentState = 'tournament';
        this.matchmakingManager.stopMatchmaking();
        this.render();
        this.showMessage('🎉 All players ready! Tournament starting...');
      } else {
        this.matchmakingManager.showError('❌ Some players were not ready. Returning to matchmaking...');
        this.matchmakingManager.updateStatus('🔍 Looking for new players...');
      }
    });

    this.websocketClient.setOnError((error) => {
      console.error('WebSocket error:', error);
      this.showError('Connection lost. Using local mode.');
      this.fallbackToLocalMode();
    });

    await this.websocketClient.connect(this.currentTournament.id, this.playerId);
  }

  isPlayerInMatch(matchData) {
    return matchData.player1_id === this.playerId || 
           matchData.player2_id === this.playerId;
  }

  async startPlayerBattle(matchData) {
    if (this.isInBattle) return;
    
    this.isInBattle = true;
    const isPlayer1 = matchData.player1_id === this.playerId;
    const enemyHeroId = isPlayer1 ? matchData.player2_hero_id : matchData.player1_hero_id;
    const enemyHero = heroes.find(h => h.id === enemyHeroId);

    this.isolatedCombat.init(
      this.userHero,
      enemyHero,
      matchData.match_id,
      this.websocketClient
    );

    this.isolatedCombat.setOnBattleEnd((result) => {
      this.isInBattle = false;
      this.render();
      
      if (result === 'victory') {
        this.showMessage('🎉 You won your match! Waiting for other matches to complete...');
      } else if (result === 'defeat') {
        this.showMessage('💀 You were eliminated from the tournament.');
        setTimeout(() => {
          if (this.onTournamentEnd) {
            this.onTournamentEnd('eliminated');
          }
        }, 3000);
      }
    });
  }

  fallbackToLocalMode() {
    this.currentState = 'tournament';
    this.matchmakingManager.stopMatchmaking();
    
    this.currentTournament = {
      id: 'local',
      name: 'Local Tournament',
      status: 'active',
      max_players: 8
    };
    
    this.tournamentState = {
      participants: [
        { player_id: this.playerId, hero_id: this.userHero.id, status: 'ready' }
      ]
    };
    
    for (let i = 1; i < 8; i++) {
      const randomHero = heroes[Math.floor(Math.random() * heroes.length)];
      this.tournamentState.participants.push({
        player_id: `ai_${i}`,
        hero_id: randomHero.id,
        status: 'ready'
      });
    }
    
    this.render();
    
    setTimeout(() => {
      const enemyHero = heroes[Math.floor(Math.random() * heroes.length)];
      this.startLocalBattle(enemyHero);
    }, 2000);
  }

  startLocalBattle(enemyHero) {
    this.isInBattle = true;
    
    this.isolatedCombat.init(
      this.userHero,
      enemyHero,
      'local_match',
      null
    );

    this.isolatedCombat.setOnBattleEnd((result) => {
      this.isInBattle = false;
      
      if (result === 'victory') {
        this.showMessage('🎉 Victory! Starting next round...');
        setTimeout(() => {
          const nextEnemyHero = heroes[Math.floor(Math.random() * heroes.length)];
          this.startLocalBattle(nextEnemyHero);
        }, 3000);
      } else if (result === 'defeat') {
        this.showMessage('💀 Tournament ended!');
        setTimeout(() => {
          if (this.onTournamentEnd) {
            this.onTournamentEnd('defeat');
          }
        }, 3000);
      }
    });
  }

  render() {
    if (this.isInBattle) {
      return;
    }

    if (this.currentState === 'matchmaking') {
      this.matchmakingManager.render();
      return;
    }

    this.container.innerHTML = `
      <div class="rounds-container">
        <h1 class="rounds-title">🏟️ Tournament Lobby</h1>
        
        <div class="tournament-info">
          <div class="tournament-details">
            <h2>${this.currentTournament?.name || 'Loading...'}</h2>
            <p>Tournament ID: ${this.currentTournament?.id || 'N/A'}</p>
            <p>Status: ${this.currentTournament?.status || 'waiting'}</p>
          </div>
          
          <div class="player-status">
            <h3>Your Hero</h3>
            <div class="hero-card-mini">
              <span class="hero-avatar">${this.userHero?.avatar || '❓'}</span>
              <span class="hero-name">${this.userHero?.name || 'Unknown'}</span>
            </div>
          </div>
        </div>
        
        <div class="tournament-participants">
          <h3>Tournament Participants</h3>
          <div class="participants-grid">
            ${this.renderParticipants()}
          </div>
        </div>
        
        <div class="tournament-status">
          <div class="status-message" id="status-message">
            ${this.getStatusMessage()}
          </div>
        </div>
        
        <div class="tournament-controls">
          <button class="action-button secondary" id="back-to-selection">Back to Hero Selection</button>
          <button class="action-button secondary" id="leave-tournament">Leave Tournament</button>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  renderParticipants() {
    if (!this.tournamentState?.participants) {
      return '<p>Loading participants...</p>';
    }
    
    const participants = this.tournamentState.participants;
    const maxPlayers = this.currentTournament?.max_players || 8;
    
    let participantsHtml = '';
    
    for (let i = 0; i < maxPlayers; i++) {
      if (i < participants.length) {
        const participant = participants[i];
        const hero = heroes.find(h => h.id === participant.hero_id);
        const isCurrentUser = participant.player_id === this.playerId;
        
        participantsHtml += `
          <div class="participant-card ${isCurrentUser ? 'current-user' : ''}">
            <div class="participant-avatar">${hero?.avatar || '❓'}</div>
            <div class="participant-name">${hero?.name || 'Unknown'}${isCurrentUser ? ' (You)' : ''}</div>
            <div class="participant-status">${participant.status}</div>
          </div>
        `;
      } else {
        participantsHtml += `
          <div class="participant-card empty">
            <div class="participant-avatar">⏳</div>
            <div class="participant-name">Waiting...</div>
            <div class="participant-status">open</div>
          </div>
        `;
      }
    }
    
    return participantsHtml;
  }

  getStatusMessage() {
    if (!this.currentTournament) {
      return 'Loading tournament...';
    }
    
    if (this.currentTournament.id === 'local') {
      return 'Playing in local mode - battles will start automatically!';
    }
    
    if (this.currentTournament.status === 'waiting') {
      const currentPlayers = this.tournamentState?.participants?.length || 0;
      const maxPlayers = this.currentTournament.max_players;
      
      if (currentPlayers < maxPlayers) {
        return `🔍 Waiting for players... (${currentPlayers}/${maxPlayers})`;
      } else {
        return '✅ Tournament is full! Starting soon...';
      }
    } else if (this.currentTournament.status === 'active') {
      return 'Tournament is active! Matches in progress...';
    } else if (this.currentTournament.status === 'completed') {
      return 'Tournament completed!';
    }
    
    return 'Unknown tournament status';
  }

  attachEventListeners() {
    const backBtn = this.container.querySelector('#back-to-selection');
    const leaveBtn = this.container.querySelector('#leave-tournament');

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.disconnect();
        if (this.onTournamentEnd) {
          this.onTournamentEnd('back');
        }
      });
    }

    if (leaveBtn) {
      leaveBtn.addEventListener('click', async () => {
        try {
          if (this.currentTournament.id !== 'local') {
            await this.tournamentClient.leaveTournament(this.currentTournament.id);
          }
          this.disconnect();
          if (this.onTournamentEnd) {
            this.onTournamentEnd('left');
          }
        } catch (error) {
          console.error('Failed to leave tournament:', error);
          this.showError('Failed to leave tournament');
        }
      });
    }
  }

  updateTournamentDisplay() {
    if (!this.isInBattle) {
      if (this.currentState === 'matchmaking') {
        const currentPlayers = this.tournamentState?.participants?.length || 0;
        const maxPlayers = this.currentTournament?.max_players || 8;
        this.matchmakingManager.updateStatus(`🔍 Matchmaking... (${currentPlayers}/${maxPlayers} players)`);
        
        if (currentPlayers >= maxPlayers) {
          this.matchmakingManager.updateStatus('✅ Tournament is full! Ready check starting...');
        }
      } else {
        this.render();
      }
    }
  }

  showMessage(message) {
    const statusEl = this.container.querySelector('#status-message');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = 'status-message highlight';
      
      setTimeout(() => {
        statusEl.className = 'status-message';
      }, 3000);
    }
  }

  showError(message) {
    const statusEl = this.container.querySelector('#status-message');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = 'status-message error';
    }
  }

  disconnect() {
    if (this.websocketClient) {
      this.websocketClient.disconnect();
    }
  }

  setupMatchmakingCallbacks() {
    this.matchmakingManager.setOnMatchmakingCancelled((reason) => {
      this.disconnect();
      if (this.onTournamentEnd) {
        this.onTournamentEnd(reason);
      }
    });

    this.matchmakingManager.setOnPlayerReady(() => {
      this.websocketClient.sendPlayerReady();
    });
  }

  setOnTournamentEnd(callback) {
    this.onTournamentEnd = callback;
  }
}

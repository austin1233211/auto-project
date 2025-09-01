import { heroes } from './heroes.js';
import { Combat } from './combat.js';

export class RoundsManager {
  constructor(container) {
    this.container = container;
    this.currentTournament = null;
    this.tournamentState = null;
    this.onTournamentEnd = null;
    this.combat = new Combat(this.container);
    this.userHero = null;
    this.playerId = null;
    this.isInBattle = false;
    this.currentState = 'tournament';
  }

  async init(userHero = null) {
    this.userHero = userHero;
    this.playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.startLocalTournament();
  }

  startLocalTournament() {
    
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
    
    this.combat.init(this.userHero, enemyHero);

    this.combat.setOnBattleEnd((result) => {
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

    this.container.innerHTML = `
      <div class="rounds-container">
        <div class="tournament-main">
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
          
          <div class="tournament-status">
            <div class="status-message" id="status-message">
              ${this.getStatusMessage()}
            </div>
          </div>
          
          <div class="tournament-controls">
            <button class="action-button secondary" id="back-to-selection">Back to Hero Selection</button>
          </div>
        </div>
        
        <div class="players-sidebar">
          <h3>Tournament Participants</h3>
          <div class="players-list">
            ${this.renderParticipants()}
          </div>
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
          <div class="player-card ${isCurrentUser ? 'active' : ''}">
            <div class="player-info">
              <span class="player-name">${hero?.name || 'Unknown'}${isCurrentUser ? ' (You)' : ''}</span>
            </div>
            <div class="player-hero">${hero?.avatar || '❓'} ${participant.status}</div>
          </div>
        `;
      } else {
        participantsHtml += `
          <div class="player-card">
            <div class="player-info">
              <span class="player-name">Waiting...</span>
            </div>
            <div class="player-hero">⏳ open</div>
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

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (this.onTournamentEnd) {
          this.onTournamentEnd('back');
        }
      });
    }
  }

  updateTournamentDisplay() {
    if (!this.isInBattle) {
      this.render();
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


  setOnTournamentEnd(callback) {
    this.onTournamentEnd = callback;
  }
}

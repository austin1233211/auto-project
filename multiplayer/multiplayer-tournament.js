import { heroes } from '../heroes.js';
import { Combat } from '../combat.js';
import { HeroStatsCard } from '../hero-stats-card.js';
import { MultiplayerClient } from './multiplayer-client.js';

export class MultiplayerTournament {
  constructor(container, onExitToMenu) {
    this.container = container;
    this.client = new MultiplayerClient();
    this.player = { name: `Player_${Math.floor(Math.random()*100000)}` };
    this.selectedHero = null;
    this.heroStatsCard = new HeroStatsCard();
    this.combat = null;
    this.onExitToMenu = onExitToMenu;
    this.currentPhase = 'lobby';
    this.players = [];
  }

  init() {
    this.renderLobby();
    this.attachLobbyEvents();
    this.client.connect();
    this.client.on('connected', () => {
      this.client.requestTournament({ name: this.player.name });
    });
    this.client.on('lobbyUpdate', (payload) => this.updateLobby(payload));
    this.client.on('tournamentStart', () => this.showBuffer());
    this.client.on('roundState', (state) => this.updateRoundState(state));
    this.client.on('matchAssign', (match) => this.handleMatchAssign(match));
    this.client.on('roundComplete', (payload) => this.handleRoundComplete(payload));
    this.client.on('tournamentEnd', (payload) => this.handleTournamentEnd(payload));
    this.client.on('queueStatus', (qs) => this.updateQueueStatus(qs));
  }

  renderLobby() {
    this.container.innerHTML = `
      <div class="lobby-container">
        <h1>Multiplayer Tournament Lobby</h1>
        <div class="lobby-grid">
          <div class="lobby-left">
            <div class="name-entry">
              <label>Your name</label>
              <input id="mt-name" value="${this.player.name}" />
              <button id="mt-apply-name">Apply</button>
            </div>
            <div class="hero-select">
              <h3>Select your hero</h3>
              <div class="heroes-grid">
                ${heroes.map(h => `
                  <button class="hero-pick" data-id="${h.id}">${h.avatar} ${h.name}</button>
                `).join('')}
              </div>
            </div>
            <div class="actions">
              <button id="mt-ready" disabled>Ready</button>
            </div>
          </div>
          <div class="lobby-right">
            <h3>Players (need 8)</h3>
            <div id="mt-players"></div>
          </div>
        </div>
        <div id="mt-phase"></div>
      </div>
    `;
  }

  attachLobbyEvents() {
    const applyBtn = this.container.querySelector('#mt-apply-name');
    const nameInput = this.container.querySelector('#mt-name');
    if (applyBtn && nameInput) {
      applyBtn.addEventListener('click', () => {
        this.player.name = nameInput.value || this.player.name;
        this.client.updateName({ name: this.player.name });
      });
    }
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-id]');
      if (btn && btn.dataset && btn.dataset.id) {
        const heroId = btn.dataset.id;
        this.selectedHero = heroes.find(h => h.id === heroId);
        if (this.selectedHero) {
          this.client.selectHero(this.selectedHero);
          const readyBtn = this.container.querySelector('#mt-ready');
          if (readyBtn) readyBtn.disabled = false;
        }
      }
    });
    const readyBtn = this.container.querySelector('#mt-ready');
    if (readyBtn) {
      readyBtn.addEventListener('click', () => {
        this.client.setReady();
        readyBtn.disabled = true;
        readyBtn.textContent = 'Ready ✓';
      });
    }
  }

  updateLobby(payload) {
    this.players = payload.players || [];
    const div = this.container.querySelector('#mt-players');
    if (div) {
      div.innerHTML = this.players.map(p => `
        <div class="player-status">
          <span>${p.name}</span>
          <span>${p.heroSelected ? '🛡️' : '⏳'}</span>
          <span>${p.isReady ? '✓' : '…'}</span>
        </div>
      `).join('');
    }
    const phase = this.container.querySelector('#mt-phase');
    if (phase) {
      phase.textContent = payload.phase ? `Phase: ${payload.phase}` : '';
    }
  }
 
  updateQueueStatus(qs) {
    const phase = this.container.querySelector('#mt-phase');
    if (phase && this.currentPhase === 'lobby') {
      phase.textContent = `Waiting for players: ${qs.queued}/${qs.needed}`;
    }
  }

  showBuffer() {
    this.currentPhase = 'buffer';
    this.renderTournamentScaffold();
  }

  renderTournamentScaffold() {
    this.container.innerHTML = `
      <div class="rounds-container">
        <div class="tournament-main">
          <h1 class="rounds-title">Multiplayer Tournament</h1>
          <div class="round-info">
            <h2 id="mt-round-title">Round</h2>
            <p id="mt-players-remaining"></p>
            <div id="round-timer" class="round-timer">
              <div class="timer-display">Preparing round...</div>
            </div>
          </div>
          <div id="battle-area" class="battle-area"></div>
          <div class="tournament-controls">
            <button class="action-button secondary" id="mt-exit">Exit</button>
          </div>
        </div>
        <div class="players-sidebar">
          <h3>Players</h3>
          <div class="players-list" id="players-list"></div>
        </div>
      </div>
    `;
    const exitBtn = this.container.querySelector('#mt-exit');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        this.client.leaveRoom();
        if (this.onExitToMenu) this.onExitToMenu();
      });
    }
    this.heroStatsCard.init();
  }

  updateRoundState(state) {
    const title = this.container.querySelector('#mt-round-title');
    if (title) title.textContent = `Round ${state.roundNumber}`;
    const remain = this.container.querySelector('#mt-players-remaining');
    if (remain) remain.textContent = `${state.activeCount} players remaining${state.ghostCount > 0 ? ` (${state.ghostCount} ghosts)` : ''}`;
    const timerEl = this.container.querySelector('#round-timer .timer-display');
    if (timerEl) {
      const minutes = Math.floor(state.time / 60);
      const seconds = state.time % 60;
      const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      if (state.phase === 'buffer') {
        timerEl.textContent = `Pre-Round: ${timeString}`;
      } else {
        const multiplierText = state.damageMultiplier > 1 ? ` (${(state.damageMultiplier * 100).toFixed(0)}% damage)` : '';
        timerEl.textContent = `Round Timer: ${timeString}${multiplierText}`;
      }
    }
    if (state.players) {
      const list = this.container.querySelector('#players-list');
      if (list) list.innerHTML = state.players.map(p => {
        const hpPct = Math.max(0, Math.min(100, Math.round((p.hp.current / p.hp.max) * 100)));
        return `
          <div class="player-card ${p.isEliminated ? 'eliminated' : ''} ${p.isGhost ? 'ghost' : ''}">
            <div class="player-info">
              <div class="player-name">${p.name}</div>
              <div class="player-hero">${(heroes.find(h => h.id === p.heroId) || { avatar: '❓', name: 'Unknown' }).avatar} ${(heroes.find(h => h.id === p.heroId) || { name: 'Unknown' }).name}</div>
            </div>
            <div class="player-health">
              <div class="health-bar">
                <div class="health-fill" style="width: ${hpPct}%"></div>
                <span class="health-text">${p.hp.current}/${p.hp.max}</span>
              </div>
            </div>
            <div class="player-stats">
              <span class="wins">Wins: ${p.wins || 0}</span>
              <span class="losses">Losses: ${p.losses || 0}</span>
              <span class="gold">💰 ${p.gold || 0}</span>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  handleMatchAssign(match) {
    const me = match.me;
    const opp = match.opponent;
    const myHero = heroes.find(h => h.id === me.heroId);
    const oppHero = heroes.find(h => h.id === opp.heroId);
    const combatContainer = this.container.querySelector('#battle-area');
    if (this.combat) {
      this.combat.clearTimers();
      this.combat = null;
    }
    this.combat = new Combat(combatContainer, this.heroStatsCard);
    this.combat.setOnBattleEnd((result) => {
      const winnerId = result === 'victory' ? me.id : opp.id;
      const hpLost = result === 'victory' ? match.hpLossOnOpponent || 5 : match.hpLossOnMe || 5;
      this.client.sendBattleResult({ matchId: match.matchId, winnerId, hpLost });
    });
    this.combat.selectRandomEnemy = () => ({ ...oppHero });
    this.combat.init(myHero, match.myGold || 0);
    this.heroStatsCard.updateHero(myHero);
  }

  handleRoundComplete(payload) {
    const combatContainer = this.container.querySelector('#battle-area');
    if (this.combat) {
      this.combat.clearTimers();
      this.combat = null;
    }
    if (combatContainer) combatContainer.innerHTML = '';
    this.updateRoundState({
      roundNumber: payload.roundNumber,
      activeCount: payload.activeCount,
      ghostCount: payload.ghostCount,
      phase: 'buffer',
      time: payload.nextBuffer || 30,
      players: payload.players
    });
  }

  handleTournamentEnd(payload) {
    const combatContainer = this.container.querySelector('#battle-area');
    if (this.combat) {
      this.combat.clearTimers();
      this.combat = null;
    }
    if (combatContainer) {
      combatContainer.innerHTML = `<div class="tournament-end">Winner: ${payload.winner.name}</div>`;
      setTimeout(() => {
        if (this.onExitToMenu) this.onExitToMenu();
      }, 3000);
    }
  }
}

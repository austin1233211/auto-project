import { heroes } from '../heroes.js';
import { Combat } from '../combat.js';
import { HeroStatsCard } from '../hero-stats-card.js';
import { MultiplayerClient } from './multiplayer-client.js';
import { Timer } from '../timer.js';
import { PlayerCounter } from '../player-counter.js';

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
    this.displayedHeroes = [];
    this.timer = new Timer();
    this.timerActive = false;
  }

  setupTimer() {
    this.timer.setOnTimerUpdate((timerData) => this.updateTimerDisplay(timerData));
    this.timer.setOnRoundEnd(() => this.handleTimerExpired());
  }

  startSelectionTimer() {
    this.timerActive = true;
    const el = this.container.querySelector('#selection-timer');
    if (el) el.style.display = 'block';
    this.timer.startRound();
  }

  updateTimerDisplay(timerData) {
    const el = this.container.querySelector('#selection-timer .timer-display');
    if (el) {
      const minutes = Math.floor(timerData.time / 60);
      const seconds = timerData.time % 60;
      el.textContent = `Selection Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  handleTimerExpired() {
    if (!this.selectedHero && this.timerActive) {
      const randomIndex = Math.floor(Math.random() * this.displayedHeroes.length);
      this.selectHero(this.displayedHeroes[randomIndex].id);
      const note = document.createElement('div');
      note.className = 'auto-select-notification';
      note.textContent = 'Time expired! Hero auto-selected.';
      this.container.appendChild(note);
      setTimeout(() => {
        if (note.parentNode) note.parentNode.removeChild(note);
      }, 3000);
    }
    this.timerActive = false;
  }

  init() {
    this.setupTimer();
    this.renderLobby();
    this.attachLobbyEvents();
    this.startSelectionTimer();
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

  getRandomHeroes(count) {
    const shuffled = [...heroes].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map((hero, index) => ({
      ...hero,
      displayIndex: index,
      hasBeenRerolled: false
    }));
  }
  renderHeroCard(hero, displayIndex) {
    return `
      <div class="hero-card" data-hero-id="${hero.id}" data-display-index="${displayIndex}">
        <div class="hero-avatar">${hero.avatar}</div>
        <div class="hero-name">${hero.name}</div>
        <div class="hero-type">${hero.type}</div>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-label">HP</span>
            <span class="stat-value">${hero.stats.health}</span>
          </div>
          <div class="stat">
            <span class="stat-label">ATK</span>
            <span class="stat-value">${hero.stats.attack}</span>
          </div>
          <div class="stat">
            <span class="stat-label">ARM</span>
            <span class="stat-value">${hero.stats.armor}</span>
          </div>
          <div class="stat">
            <span class="stat-label">SPD</span>
            <span class="stat-value">${hero.stats.speed}</span>
          </div>
          <div class="stat">
            <span class="stat-label">CRIT</span>
            <span class="stat-value">${(hero.stats.critChance * 100).toFixed(1)}%</span>
          </div>
          <div class="stat">
            <span class="stat-label">EVA</span>
            <span class="stat-value">${(hero.stats.evasionChance * 100).toFixed(1)}%</span>
          </div>
        </div>
        <button class="reroll-btn" data-display-index="${displayIndex}" ${hero.hasBeenRerolled ? 'disabled' : ''}>
          ${hero.hasBeenRerolled ? 'Re-rolled' : 'Re-roll'}
        </button>
      </div>
    `;
  }

  updateHeroCard(displayIndex) {
    const heroCard = this.container.querySelector(`[data-display-index="${displayIndex}"]`);
    if (heroCard) {
      heroCard.outerHTML = this.renderHeroCard(this.displayedHeroes[displayIndex], displayIndex);
      this.reattachHeroCardListeners();
    }
  }

  reattachHeroCardListeners() {
    this.container.removeEventListener('click', this.heroClickHandler);
    this.heroClickHandler = (e) => {
      const card = e.target.closest('.hero-card');
      const rerollBtn = e.target.closest('.reroll-btn');
      if (rerollBtn) {
        e.stopPropagation();
        const idx = parseInt(rerollBtn.dataset.displayIndex);
        this.rerollHero(idx);
        return;
      }
      if (card) {
        const heroId = card.dataset.heroId;
        this.selectHero(heroId);
      }
    };
    this.container.addEventListener('click', this.heroClickHandler);
  }

  renderHeroDetails(hero) {
    return `
      <div class="selected-hero-name">${hero.name}</div>
      <div class="selected-hero-description">${hero.description}</div>
      <div class="selected-hero-abilities">
        <div class="ability">
          <div class="ability-name">Passive: ${hero.abilities.passive.name}</div>
          <div class="ability-description">${hero.abilities.passive.description}</div>
        </div>
        <div class="ability">
          <div class="ability-name">Ultimate: ${hero.abilities.ultimate.name}</div>
          <div class="ability-description">${hero.abilities.ultimate.description}</div>
        </div>
      </div>
    `;
  }

  selectHero(heroId) {
    const prev = this.container.querySelector('.hero-card.selected');
    if (prev) prev.classList.remove('selected');
    const heroCard = this.container.querySelector(`[data-hero-id="${heroId}"]`);
    if (heroCard) heroCard.classList.add('selected');

    this.selectedHero = this.displayedHeroes.find(h => h.id === heroId);
    const details = this.container.querySelector('.hero-details');
    if (details && this.selectedHero) {
      details.classList.remove('empty');
      details.innerHTML = this.renderHeroDetails(this.selectedHero);
    }
    if (this.selectedHero) {
      this.client.selectHero(this.selectedHero);
      const readyBtn = this.container.querySelector('#mt-ready');
      if (readyBtn) {
        readyBtn.disabled = false;
        readyBtn.classList.add('enabled');
      }
      if (this.timerActive) {
        this.timer.stopTimer();
        this.timerActive = false;
        const el = this.container.querySelector('#selection-timer');
        if (el) el.style.display = 'none';
      }
    }
  }

  rerollHero(displayIndex) {
    if (!this.displayedHeroes.length) return;
    if (this.displayedHeroes[displayIndex]?.hasBeenRerolled) return;
    const currentIds = this.displayedHeroes.map(h => h.id);
    const pool = heroes.filter(h => !currentIds.includes(h.id));
    if (!pool.length) return;
    const replacement = pool[Math.floor(Math.random() * pool.length)];
    this.displayedHeroes[displayIndex] = {
      ...replacement,
      displayIndex,
      hasBeenRerolled: true
    };
    const grid = this.container.querySelector('.heroes-grid');
    if (grid) {
      grid.innerHTML = this.displayedHeroes.map((h, i) => this.renderHeroCard(h, i)).join('');
      this.reattachHeroCardListeners();
    }
  }

  renderLobby() {
    this.displayedHeroes = this.getRandomHeroes(3);
    this.container.innerHTML = `
      <div class="hero-selection-container">
        <h1 class="hero-selection-title">Choose Your Gladiator</h1>

        <div id="selection-timer" class="selection-timer">
          <div class="timer-display">Selection Time: 0:50</div>
        </div>

        <div class="heroes-grid">
          ${this.displayedHeroes.map((hero, index) => this.renderHeroCard(hero, index)).join('')}
        </div>

        <div class="hero-details empty">
          <p>Select a hero to view details</p>
        </div>

        <button class="start-button play-btn" id="mt-ready" disabled>Ready</button>

        <div class="game-mode-details" style="margin-top:1rem;">
          <div class="selected-mode-name">Multiplayer Tournament</div>
          <div class="selected-mode-description">8 players, synchronized rounds</div>
          <div class="selected-mode-features">
            <div class="feature"><span class="feature-text">Waiting room: <span id="mt-phase"></span></span></div>
            <div class="feature"><span class="feature-text">Players:</span></div>
            <div id="mt-player-counter" class="player-counter"></div>
            <div id="mt-players"></div>
          </div>
        </div>

        <div style="display:flex; gap:.5rem; margin-top:.5rem;">
          <input id="mt-name" value="${this.player.name}" style="flex:1;"/>
          <button class="action-button secondary" id="mt-apply-name" style="flex:0 0 auto;">Apply</button>
        </div>
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
    this.reattachHeroCardListeners();
    const readyBtn = this.container.querySelector('#mt-ready');
    if (readyBtn) {
      readyBtn.addEventListener('click', () => {
        this.client.setReady();
        readyBtn.disabled = true;
        readyBtn.textContent = 'Ready ✓';
      });
    }
    const counterHost = this.container.querySelector('#mt-player-counter');
    if (counterHost && !this.playerCounter) {
      this.playerCounter = new PlayerCounter(counterHost);
      this.playerCounter.mount();
      this.playerCounter.setCounts(0, 8);
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
    if (this.playerCounter && this.currentPhase === 'lobby') {
      this.playerCounter.setCounts(this.players.length, 8);
    }
  }
 
  updateQueueStatus(qs) {
    const phase = this.container.querySelector('#mt-phase');
    if (phase && this.currentPhase === 'lobby') {
      phase.textContent = `Waiting for players: ${qs.queued}/${qs.needed}`;
    }
    if (this.playerCounter && this.currentPhase === 'lobby') {
      this.playerCounter.setCounts(qs.queued, qs.needed);
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

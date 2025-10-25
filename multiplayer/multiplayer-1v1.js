import { heroes } from '../src/core/heroes.js';
import { Combat } from '../src/systems/combat.js';
import { HeroStatsCard } from '../src/ui/hero-stats-card.js';
import { MultiplayerClient } from './multiplayer-client.js';

export class MultiplayerDuel {
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
    this.requestedReady = false;
    this.selectionLocked = false;
  }

  init() {
    this.renderLobby();
    this.attachLobbyEvents();
    this.client.connect();
    this.client.on('connected', () => {
      this.client.requestMatch({ name: this.player.name });
    });
    this.client.on('roomStatusUpdate', (status) => this.updateRoomStatus(status));
    this.client.on('proceedToRules', (data) => this.showRules(data));
    this.client.on('gameStarting', (data) => this.showStartingCountdown(data));
    this.client.on('roundState', (state) => this.updateRoundState(state));
    this.client.on('matchAssign', (match) => this.handleMatchAssign(match));
    this.client.on('roundComplete', (payload) => this.handleRoundComplete(payload));
    this.client.on('tournamentEnd', (payload) => this.handleDuelEnd(payload));
  }

  renderLobby() {
    this.container.innerHTML = `
      <div class="hero-selection-container">
        <h1 class="hero-selection-title">Multiplayer 1v1</h1>
        <div class="heroes-grid">
          ${this.getRandomHeroes(3).map((hero, index) => this.renderHeroCard(hero, index)).join('')}
        </div>
        <div class="hero-details empty"><p>Select a hero to view details</p></div>
        <button class="start-button play-btn" id="duel-ready" disabled>Ready</button>
        <div class="game-mode-details" style="margin-top:1rem;">
          <div class="selected-mode-name">Multiplayer (1v1)</div>
          <div class="selected-mode-description">Head-to-head battle</div>
          <div id="duel-players"></div>
        </div>
        <div style="display:flex; gap:.5rem; margin-top:.5rem;">
          <input id="duel-name" value="${this.player.name}" style="flex:1;"/>
          <button class="action-button secondary" id="duel-apply-name" style="flex:0 0 auto;">Apply</button>
        </div>
      </div>
    `;
    this.heroStatsCard.init();
  }

  getRandomHeroes(count) {
    const shuffled = [...heroes].sort(() => Math.random() - 0.5);
    this.displayedHeroes = shuffled.slice(0, count).map((h,i) => ({...h, displayIndex:i, hasBeenRerolled:false}));
    return this.displayedHeroes;
  }

  renderHeroCard(hero, idx) {
    return `
      <div class="hero-card" data-hero-id="${hero.id}" data-display-index="${idx}">
        <div class="hero-avatar">${hero.avatar}</div>
        <div class="hero-name">${hero.name}</div>
        <div class="hero-type">${hero.type}</div>
        <div class="hero-stats">
          <div class="stat"><span class="stat-label">HP</span><span class="stat-value">${hero.stats.health}</span></div>
          <div class="stat"><span class="stat-label">ATK</span><span class="stat-value">${hero.stats.attack}</span></div>
          <div class="stat"><span class="stat-label">ARM</span><span class="stat-value">${hero.stats.armor}</span></div>
          <div class="stat"><span class="stat-label">SPD</span><span class="stat-value">${hero.stats.speed}</span></div>
        </div>
        <button class="reroll-btn" data-display-index="${idx}">Re-roll</button>
      </div>
    `;
  }

  attachLobbyEvents() {
    const applyBtn = this.container.querySelector('#duel-apply-name');
    const nameInput = this.container.querySelector('#duel-name');
    if (applyBtn && nameInput) {
      applyBtn.addEventListener('click', () => {
        this.player.name = nameInput.value || this.player.name;
        this.client.updateName({ name: this.player.name });
      });
    }
    this.container.addEventListener('click', (e) => {
      if (this.selectionLocked) {
        e.stopPropagation();
        return;
      }
      const rerollBtn = e.target.closest('.reroll-btn');
      if (rerollBtn) {
        const idx = parseInt(rerollBtn.dataset.displayIndex);
        this.rerollHero(idx);
        return;
      }
      const card = e.target.closest('.hero-card');
      if (card) {
        const heroId = card.dataset.heroId;
        this.selectHero(heroId);
      }
    });
    const readyBtn = this.container.querySelector('#duel-ready');
    if (readyBtn) {
      readyBtn.addEventListener('click', () => {
        this.requestedReady = true;
        this.selectionLocked = true;
        this.client.setReady();
        readyBtn.disabled = true;
        readyBtn.textContent = 'Ready ✓';
        const rerollBtns = this.container.querySelectorAll('.reroll-btn');
        rerollBtns.forEach(b => b.disabled = true);
        const heroCards = this.container.querySelectorAll('.hero-card');
        heroCards.forEach(c => c.classList.add('locked'));
      });
    }
  }

  rerollHero(idx) {
    if (!this.displayedHeroes?.length) return;
    if (this.displayedHeroes[idx]?.hasBeenRerolled) return;
    const currentIds = this.displayedHeroes.map(h => h.id);
    const pool = heroes.filter(h => !currentIds.includes(h.id));
    if (!pool.length) return;
    const replacement = pool[Math.floor(Math.random() * pool.length)];
    this.displayedHeroes[idx] = { ...replacement, displayIndex: idx, hasBeenRerolled: true };
    const grid = this.container.querySelector('.heroes-grid');
    if (grid) {
      grid.innerHTML = this.displayedHeroes.map((h, i) => this.renderHeroCard(h, i)).join('');
    }
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
      details.innerHTML = `
        <div class="selected-hero-name">${this.selectedHero.name}</div>
        <div class="selected-hero-description">${this.selectedHero.description}</div>
      `;
    }
    if (this.selectedHero) {
      this.client.selectHero(this.selectedHero);
      const readyBtn = this.container.querySelector('#duel-ready');
      if (readyBtn) {
        readyBtn.disabled = false;
        readyBtn.classList.add('enabled');
      }
    }
  }

  updateRoomStatus(status) {
    const list = this.container.querySelector('#duel-players');
    if (!list) return;
    const players = status.players || [];
    list.innerHTML = players.map(p => `
      <div class="player-status">
        <span>${p.name || ''}</span>
        <span>${p.heroSelected ? '🛡️' : '⏳'}</span>
        <span>${p.isReady ? '✓' : '…'}</span>
      </div>
    `).join('');
    if (status?.phase === 'waiting_for_ready') {
      if (this.selectedHero) {
        console.log('[1v1 client] re-emitting selectHero', this.selectedHero?.id || this.selectedHero);
        this.client.selectHero(this.selectedHero);
        const readyBtn = this.container.querySelector('#duel-ready');
        if (readyBtn && !this.selectionLocked) readyBtn.disabled = false;
      } else {
        console.log('[1v1 client] no selectedHero yet when waiting_for_ready');
      }
      if (this.requestedReady) {
        console.log('[1v1 client] re-emitting playerReady');
        this.client.setReady();
        this.selectionLocked = true;
        const rerollBtns = this.container.querySelectorAll('.reroll-btn');
        rerollBtns.forEach(b => b.disabled = true);
      }
    }
  }

  showRules(data) {
  }

  showStartingCountdown(data) {
  }

  renderDuelScaffold() {
    this.container.innerHTML = `
      <div class="rounds-container">
        <div class="tournament-main">
          <h1 class="rounds-title">Multiplayer 1v1</h1>
          <div class="round-info">
            <h2 id="duel-round-title">Round</h2>
            <div id="round-timer" class="round-timer">
              <div class="timer-display">Preparing round...</div>
            </div>
          </div>
          <div id="battle-area" class="battle-area"></div>
          <div class="tournament-controls">
            <button class="action-button secondary" id="duel-exit">Exit</button>
          </div>
        </div>
        <div class="players-sidebar">
          <h3>Players</h3>
          <div class="players-list" id="players-list"></div>
        </div>
      </div>
    `;
    const exitBtn = this.container.querySelector('#duel-exit');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        this.client.leaveRoom();
        if (this.onExitToMenu) this.onExitToMenu();
      });
    }
    this.heroStatsCard.init();
  }

  updateRoundState(state) {
    if (this.currentPhase !== 'rounds') {
      this.currentPhase = 'rounds';
      this.renderDuelScaffold();
    }
    const title = this.container.querySelector('#duel-round-title');
    if (title) title.textContent = `Round ${state.roundNumber}`;
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
    
    if (state.phase === 'buffer' && !this.combat && state.players && state.players.length >= 2) {
      const me = state.players.find(p => p.name === this.player.name) || 
                 state.players.find(p => p.heroId === this.selectedHero?.id);
      const opponent = state.players.find(p => p !== me);
      
      if (me && opponent) {
        const myHero = heroes.find(h => h.id === me.heroId);
        const oppHero = heroes.find(h => h.id === opponent.heroId);
        
        if (myHero && oppHero) {
          const combatContainer = this.container.querySelector('#battle-area');
          if (combatContainer) {
            this.combat = new Combat(combatContainer, this.heroStatsCard);
            this.combat.selectRandomEnemy = () => ({ ...oppHero });
            this.combat.init(myHero, me.gold || 0, { autoStart: false });
            this.heroStatsCard.updateHero(myHero);
            console.log('[1v1] Created Combat UI during buffer phase');
          }
        }
      }
    }
    
    if (state.players) {
      const list = this.container.querySelector('#players-list');
      if (list) list.innerHTML = state.players.map(p => {
        const hpPct = Math.max(0, Math.min(100, Math.round((p.hp.current / p.hp.max) * 100)));
        const heroMeta = heroes.find(h => h.id === p.heroId) || { avatar: '❓', name: 'Unknown' };
        return `
          <div class="player-card ${p.isEliminated ? 'eliminated' : ''} ${p.isGhost ? 'ghost' : ''}">
            <div class="player-info">
              <div class="player-name">${p.name}</div>
              <div class="player-hero">${heroMeta.avatar} ${heroMeta.name}</div>
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
      this.combat.setOnBattleEnd((result) => {
        const winnerId = result === 'victory' ? me.id : opp.id;
        this.client.sendBattleResult({ matchId: match.matchId, winnerId, hpLost: 5 });
      });
      this.combat.selectRandomEnemy = () => ({ ...oppHero });
      this.combat.startBattle();
      console.log('[1v1] Starting battle with existing Combat instance');
    } else {
      this.combat = new Combat(combatContainer, this.heroStatsCard);
      this.combat.setOnBattleEnd((result) => {
        const winnerId = result === 'victory' ? me.id : opp.id;
        this.client.sendBattleResult({ matchId: match.matchId, winnerId, hpLost: 5 });
      });
      this.combat.selectRandomEnemy = () => ({ ...oppHero });
      this.combat.init(myHero, match.myGold || 0);
      console.log('[1v1] Created new Combat instance (fallback)');
    }
  }

  handleRoundComplete(_payload) {
  }

  handleDuelEnd(payload) {
    const winner = payload?.winner;
    alert(`Duel Winner: ${winner?.name || 'Unknown'}`);
    if (this.onExitToMenu) this.onExitToMenu();
  }
}

import { heroes } from '../src/core/heroes.js';
import { MultiplayerClient } from './multiplayer-client.js';
import { sanitizeHTML } from '../src/utils/sanitize.js';
import { logger } from '../src/utils/logger.js';

export class MultiplayerLobby {
  constructor(container, onStartBattle) {
    this.container = container;
    this.client = new MultiplayerClient();
    this.player = { name: `Player_${Math.floor(Math.random()*100000)}` };
    this.selectedHero = null;
    this.onStartBattle = onStartBattle;
    this.displayedHeroes = [];
    this.readySent = false;
  }

  init() {
    this.displayedHeroes = this.getRandomHeroes(3);
    this.render();
    this.attachEvents();
    this.client.enableAutoRequestMatch(this.player.name);
    this.updateConnStatus();
    if (this.client.isConnected) {
      this.client.requestMatch({ name: this.player.name });
    } else {
      this.client.connect();
    }
    this.client.on('connected', () => {
      this.updateConnStatus();
    });
    this.client.on('socketError', (msg) => {
      const el = this.container.querySelector('#mt-conn');
      if (el) el.textContent = `Connection issue: ${msg}`;
    });
    this.client.on('roomStatusUpdate', (status) => {
      logger.debug('[1v1] roomStatusUpdate', status);
      this.updateStatus(status);
      this.updateConnStatus(status.players && status.players.length === 2 ? 'paired' : null);
    });
    this.client.on('proceedToRules', (data) => {
      logger.debug('[1v1] proceedToRules', data);
      this.showRules();
    });
    this.client.on('gameStarting', (data) => {
      logger.debug('[1v1] gameStarting', data);
      this.showCountdown(data.countdown);
    });
    this.client.on('gameStart', (data) => {
      logger.debug('[1v1] gameStart', data);
      const meRaw = data.players.find(p => p.name === this.player.name) || data.players[0];
      const opponentRaw = data.players.find(p => p.name !== this.player.name) || data.players[1];
      const normalize = (p) => ({ ...p, heroId: p.heroId ?? (p.hero && p.hero.id) ?? p.hero });
      const me = normalize(meRaw);
      const opponent = normalize(opponentRaw);
      if (this.onStartBattle) this.onStartBattle({ me, opponent });
    });
  }

  getRandomHeroes(count) {
    const shuffled = [...heroes].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map((hero, index) => ({ ...hero, displayIndex: index }));
  }

  renderGrid() {
    const grid = this.container.querySelector('.heroes-grid');
    if (grid) {
      grid.innerHTML = this.displayedHeroes.map(h => this.renderHeroCard(h)).join('');
    }
  }

  rerollHero(index) {
    const currentIds = new Set(this.displayedHeroes.map(h => h.id));
    const candidates = heroes.filter(h => !currentIds.has(h.id));
    if (this.readySent) return;
    if (candidates.length === 0) return;
    const newHero = candidates[Math.floor(Math.random() * candidates.length)];
    this.displayedHeroes[index] = { ...newHero, displayIndex: index, rerolled: true };
    const selectedCard = this.container.querySelector('.hero-card.selected');
    if (selectedCard) {
      const selId = selectedCard.dataset.heroId;
      if (selId === newHero.id || selId === (this.selectedHero && this.selectedHero.id)) {
        selectedCard.classList.remove('selected');
      }
    }
    if (this.selectedHero && this.displayedHeroes[index] && this.selectedHero.id === this.displayedHeroes[index].id) {
      this.selectedHero = null;
    }
    const details = this.container.querySelector('.hero-details');
    if (details) {
      details.classList.add('empty');
      details.innerHTML = '<p>Select a hero to view details</p>';
    }
    const readyBtn = this.container.querySelector('#mt-ready');
    if (readyBtn) {
      readyBtn.disabled = true;
      readyBtn.textContent = 'Ready';
      readyBtn.classList.remove('enabled');
    }
    this.renderGrid();
  }

  renderHeroCard(hero) {
    return `
      <div class="hero-card" data-hero-id="${hero.id}" data-index="${hero.displayIndex}">
        <div class="hero-avatar">${hero.avatar}</div>
        <div class="hero-name">${hero.name}</div>
        <div class="hero-type">${hero.type}</div>
        <div class="hero-stats">
          <div class="stat"><span class="stat-label">HP</span><span class="stat-value">${hero.stats.health}</span></div>
          <div class="stat"><span class="stat-label">ATK</span><span class="stat-value">${hero.stats.attack}</span></div>
          <div class="stat"><span class="stat-label">ARM</span><span class="stat-value">${hero.stats.armor}</span></div>
          <div class="stat"><span class="stat-label">SPD</span><span class="stat-value">${hero.stats.speed}</span></div>
        </div>
        <button class="reroll-btn" ${hero.rerolled || this.readySent ? 'disabled' : ''}>Reroll</button>
      </div>
    `;
  }

  renderHeroDetails(hero) {
    return `
      <div class="selected-hero-name">${hero.name}</div>
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


  render() {
    this.container.innerHTML = `
      <div class="hero-selection-container">
        <h1 class="hero-selection-title">Choose Your Gladiator</h1>

        <div class="status-banner" style="margin-bottom:12px;">
          <div id="mt-conn"></div>
          <div id="mt-phaseInfo"></div>
        </div>

        <div class="heroes-grid">
          ${this.displayedHeroes.map(h => this.renderHeroCard(h)).join('')}
        </div>

        <div class="hero-details empty">
          <p>Select a hero to view details</p>
        </div>

        <button class="start-button play-btn" id="mt-ready" disabled>Ready</button>

        <div class="game-mode-details" style="margin-top:1rem;">
          <div class="selected-mode-name">Multiplayer 1v1</div>
          <div class="selected-mode-description">Select a hero, then click Ready. Game starts when both are ready.</div>
          <div class="selected-mode-features">
            <div class="feature"><span class="feature-text">Status: <span id="mt-phase"></span></span></div>
            <div class="feature"><span class="feature-text">Players:</span></div>
            <div id="mt-players"></div>
          </div>
          <div class="mt-queue-actions" style="margin-top:8px;">
            <button id="mt-rejoin" class="action-button small">Rejoin Queue</button>
          </div>
        </div>

        <div id="phaseInfo"></div>
      </div>
    `;
  }

  attachEvents() {
    this.container.addEventListener('click', (e) => {
      const reroll = e.target.closest('.reroll-btn');
      if (reroll) {
        e.stopPropagation();
        if (this.readySent) return;
        const card = reroll.closest('.hero-card');
        if (card) {
          const index = parseInt(card.dataset.index, 10);
          this.rerollHero(index);
        }
        return;
      }
      const rejoinBtn = e.target.closest('#mt-rejoin');
      if (rejoinBtn) {
        if (!this.client.isConnected) this.client.connect();
        this.client.requestMatch({ name: this.player.name });
        this.updateConnStatus();
        return;
      }
      const card = e.target.closest('.hero-card');
      if (card) {
        if (this.readySent) return;
        const prev = this.container.querySelector('.hero-card.selected');
        if (prev) prev.classList.remove('selected');
        card.classList.add('selected');

        const heroId = card.dataset.heroId;
        this.selectedHero = this.displayedHeroes.find(h => h.id === heroId);
        this.client.selectHero(this.selectedHero);

        const details = this.container.querySelector('.hero-details');
        if (details && this.selectedHero) {
          details.classList.remove('empty');
          details.innerHTML = this.renderHeroDetails(this.selectedHero);
        }

        const readyBtn = this.container.querySelector('#mt-ready');
        if (readyBtn) {
          readyBtn.disabled = false;
          readyBtn.classList.add('enabled');
        }
      }
    });
    const readyBtn = this.container.querySelector('#mt-ready');
    if (readyBtn) {
      let readySent = false;
      readyBtn.addEventListener('click', () => {
        if (readySent) return;
        readySent = true;
        this.readySent = true;
        this.client.setReady();
        readyBtn.disabled = true;
        readyBtn.textContent = 'Ready ✓';
        const rerollButtons = this.container.querySelectorAll('.reroll-btn');
        rerollButtons.forEach(b => { b.disabled = true; });
      });
    }
  }

  updateStatus(status) {
    const div = this.container.querySelector('#mt-players');
    if (div) {
      div.innerHTML = status.players.map(p => `
        <div class="player-status">
          <span>${sanitizeHTML(p.name)}</span>
          <span>${p.heroSelected ? '🛡️' : '⏳'}</span>
          <span>${p.isReady ? '✓' : '…'}</span>
        </div>
      `).join('');
    }
    const phase = this.container.querySelector('#mt-phase');
    if (phase) {
      const pretty = (status.phase || '').replace(/_/g, ' ');
      phase.textContent = status.phase ? `Phase: ${pretty}` : '';
    }
  }

  showRules() {
    const phase = this.container.querySelector('#phaseInfo');
    if (phase) phase.textContent = 'Both heroes selected — click Ready in both tabs to begin.';
    this.client.confirmRules();
  }

  showCountdown(count) {
    const phase = this.container.querySelector('#phaseInfo');
    if (phase) phase.textContent = `Game starting in ${count}...`;
    const banner = this.container.querySelector('#mt-phaseInfo');
    if (banner) banner.textContent = `Game starting in ${count}...`;
  }
  updateConnStatus(pairedState) {
    const el = this.container.querySelector('#mt-conn');
    if (!el) return;
    if (!this.client || !this.client.isConnected) {
      el.textContent = 'Connecting to server…';
      return;
    }
    el.textContent = pairedState === 'paired' ? 'Connected · In room with opponent' : 'Connected · Pairing…';
  }

}

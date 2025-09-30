import { heroes } from '../src/core/heroes.js';
import { MultiplayerClient } from './multiplayer-client.js';

export class MultiplayerLobby {
  constructor(container, onStartBattle) {
    this.container = container;
    this.client = new MultiplayerClient();
    this.player = { name: `Player_${Math.floor(Math.random()*100000)}` };
    this.selectedHero = null;
    this.onStartBattle = onStartBattle;
    this.displayedHeroes = [];
  }

  init() {
    this.displayedHeroes = this.getRandomHeroes(3);
    this.render();
    this.attachEvents();
    this.client.connect();
    this.client.on('connected', () => {
      this.client.requestMatch({ name: this.player.name });
    });
    if (this.client.socket && this.client.socket.connected) {
      this.client.requestMatch({ name: this.player.name });
    }
    this.client.on('roomStatusUpdate', (status) => this.updateStatus(status));
    this.client.on('proceedToRules', (data) => this.showRules());
    this.client.on('gameStarting', (data) => this.showCountdown(data.countdown));
    this.client.on('gameStart', (data) => {
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
  renderHeroCard(hero) {
    return `
      <div class="hero-card" data-hero-id="${hero.id}">
        <div class="hero-avatar">${hero.avatar}</div>
        <div class="hero-name">${hero.name}</div>
        <div class="hero-type">${hero.type}</div>
        <div class="hero-stats">
          <div class="stat"><span class="stat-label">HP</span><span class="stat-value">${hero.stats.health}</span></div>
          <div class="stat"><span class="stat-label">ATK</span><span class="stat-value">${hero.stats.attack}</span></div>
          <div class="stat"><span class="stat-label">ARM</span><span class="stat-value">${hero.stats.armor}</span></div>
          <div class="stat"><span class="stat-label">SPD</span><span class="stat-value">${hero.stats.speed}</span></div>
        </div>
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
        </div>

        <div id="phaseInfo"></div>
      </div>
    `;
  }

  attachEvents() {
    this.container.addEventListener('click', (e) => {
      const card = e.target.closest('.hero-card');
      if (card) {
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
      readyBtn.addEventListener('click', () => {
        this.client.setReady();
        readyBtn.disabled = true;
        readyBtn.textContent = 'Ready ✓';
      });
    }
  }

  updateStatus(status) {
    const div = this.container.querySelector('#mt-players');
    if (div) {
      div.innerHTML = status.players.map(p => `
        <div class="player-status">
          <span>${p.name}</span>
          <span>${p.heroSelected ? '🛡️' : '⏳'}</span>
          <span>${p.isReady ? '✓' : '…'}</span>
        </div>
      `).join('');
    }
    const phase = this.container.querySelector('#mt-phase');
    if (phase) {
      phase.textContent = status.phase ? `Phase: ${status.phase}` : '';
    }
  }

  showRules() {
    const phase = this.container.querySelector('#phaseInfo');
    if (phase) phase.textContent = 'Both heroes selected. Click Ready to start.';
    this.client.confirmRules();
  }

  showCountdown(count) {
    const phase = this.container.querySelector('#phaseInfo');
    if (phase) phase.textContent = `Game starting in ${count}...`;
  }
}

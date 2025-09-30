import { heroes } from '../src/core/heroes.js';
import { MultiplayerClient } from './multiplayer-client.js';

export class MultiplayerLobby {
  constructor(container, onStartBattle) {
    this.container = container;
    this.client = new MultiplayerClient();
    this.player = { name: `Player_${Math.floor(Math.random()*100000)}` };
    this.selectedHero = null;
    this.onStartBattle = onStartBattle;
  }

  init() {
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

  render() {
    this.container.innerHTML = `
      <div class="lobby-container">
        <h1>Multiplayer Lobby</h1>
        <div id="roomStatus"></div>
        <div class="hero-select">
          <h3>Select your hero</h3>
          <div class="heroes-grid">
            ${heroes.map(h => `
              <button class="hero-pick" data-id="${h.id}">${h.avatar} ${h.name}</button>
            `).join('')}
          </div>
        </div>
        <div class="actions">
          <button id="readyButton" disabled>Ready</button>
        </div>
        <div id="phaseInfo"></div>
      </div>
    `;
  }

  attachEvents() {
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('.hero-pick');
      if (btn) {
        const heroId = btn.dataset.id;
        this.selectedHero = heroes.find(h => h.id === heroId);
        this.client.selectHero(this.selectedHero);
        const readyBtn = this.container.querySelector('#readyButton');
        if (readyBtn) readyBtn.disabled = false;
      }
    });
    const readyBtn = this.container.querySelector('#readyButton');
    if (readyBtn) {
      readyBtn.addEventListener('click', () => {
        this.client.setReady();
        readyBtn.disabled = true;
        readyBtn.textContent = 'Ready ✓';
      });
    }
  }

  updateStatus(status) {
    const statusDiv = this.container.querySelector('#roomStatus');
    if (!statusDiv) return;
    statusDiv.innerHTML = `
      <h3>Room Status: ${status.phase.replace(/_/g,' ').toUpperCase()}</h3>
      <div class="players-status">
        ${status.players.map(p => `
          <div class="player-status">
            <span class="player-name">${p.name}</span>
            <span class="ready-status">${p.isReady ? '✓ Ready' : '⏳ Not Ready'}</span>
            <span class="hero-status">${p.heroSelected ? '✓ Hero' : '⏳ Hero'}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  showRules() {
    const phase = this.container.querySelector('#phaseInfo');
    if (phase) phase.textContent = 'Both players ready. Starting soon...';
    this.client.confirmRules();
  }

  showCountdown(count) {
    const phase = this.container.querySelector('#phaseInfo');
    if (phase) phase.textContent = `Game starting in ${count}...`;
  }
}

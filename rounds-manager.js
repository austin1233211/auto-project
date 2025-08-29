import { heroes } from './heroes.js';
import { Combat } from './combat.js';
import { StatsCalculator } from './stats-calculator.js';

export class RoundsManager {
  constructor(container) {
    this.container = container;
    this.players = [];
    this.currentRound = 1;
    this.activePlayers = [];
    this.currentMatches = [];
    this.onTournamentEnd = null;
    this.combat = null;
    this.currentMatchIndex = 0;
  }

  init() {
    this.initializePlayers();
    this.render();
    this.startRound();
  }

  initializePlayers() {
    this.players = [];
    for (let i = 0; i < 8; i++) {
      const randomHero = heroes[Math.floor(Math.random() * heroes.length)];
      const player = {
        id: i + 1,
        name: `Player ${i + 1}`,
        hero: { ...randomHero },
        health: 100,
        isEliminated: false,
        wins: 0
      };
      this.players.push(player);
    }
    this.activePlayers = [...this.players];
  }

  generateMatches() {
    const shuffled = [...this.activePlayers].sort(() => Math.random() - 0.5);
    const matches = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      matches.push({
        player1: shuffled[i],
        player2: shuffled[i + 1],
        winner: null,
        completed: false
      });
    }
    return matches;
  }

  startRound() {
    if (this.activePlayers.length <= 1) {
      this.endTournament();
      return;
    }

    this.currentMatches = this.generateMatches();
    this.currentMatchIndex = 0;
    this.updateRoundDisplay();
    this.startNextMatch();
  }

  startNextMatch() {
    if (this.currentMatchIndex >= this.currentMatches.length) {
      this.processRoundResults();
      return;
    }

    const match = this.currentMatches[this.currentMatchIndex];
    this.startBattle(match.player1, match.player2);
  }

  startBattle(player1, player2) {
    const combatContainer = this.container.querySelector('#battle-area');
    this.combat = new Combat(combatContainer);
    
    this.combat.setOnBattleEnd((result) => {
      this.processBattleResult(player1, player2, result);
    });

    this.combat.selectRandomEnemy = () => ({ ...player2.hero });
    this.combat.init(player1.hero);
  }

  processBattleResult(player1, player2, result) {
    const match = this.currentMatches[this.currentMatchIndex];
    
    if (result === 'victory') {
      match.winner = player1;
      player1.wins++;
      player2.health -= 25;
    } else {
      match.winner = player2;
      player2.wins++;
      player1.health -= 25;
    }
    
    match.completed = true;
    this.currentMatchIndex++;
    
    setTimeout(() => {
      this.startNextMatch();
    }, 2000);
  }

  processRoundResults() {
    this.activePlayers = this.activePlayers.filter(player => {
      if (player.health <= 0) {
        player.isEliminated = true;
        return false;
      }
      return true;
    });

    if (this.activePlayers.length > 1) {
      this.currentRound++;
      setTimeout(() => {
        this.startRound();
      }, 3000);
    } else {
      this.endTournament();
    }
  }

  endTournament() {
    const winner = this.activePlayers[0];
    if (this.onTournamentEnd) {
      this.onTournamentEnd(winner);
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="rounds-container">
        <div class="tournament-main">
          <h1 class="rounds-title">Tournament Arena</h1>
          <div class="round-info">
            <h2>Round ${this.currentRound}</h2>
            <p>${this.activePlayers.length} players remaining</p>
          </div>
          <div id="battle-area" class="battle-area">
            <!-- Combat will be rendered here -->
          </div>
          <div class="tournament-controls">
            <button class="action-button secondary" id="back-to-selection">Back to Hero Selection</button>
          </div>
        </div>
        
        <div class="players-sidebar">
          <h3>Players</h3>
          <div class="players-list" id="players-list">
            ${this.renderPlayersList()}
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  renderPlayersList() {
    return this.players.map(player => `
      <div class="player-card ${player.isEliminated ? 'eliminated' : ''} ${this.activePlayers.includes(player) ? 'active' : ''}">
        <div class="player-info">
          <div class="player-name">${player.name}</div>
          <div class="player-hero">${player.hero.avatar} ${player.hero.name}</div>
        </div>
        <div class="player-health">
          <div class="health-bar">
            <div class="health-fill" style="width: ${player.health}%"></div>
            <span class="health-text">${player.health}/100</span>
          </div>
        </div>
        <div class="player-stats">
          <span class="wins">Wins: ${player.wins}</span>
        </div>
      </div>
    `).join('');
  }

  updateRoundDisplay() {
    const roundInfo = this.container.querySelector('.round-info');
    if (roundInfo) {
      roundInfo.innerHTML = `
        <h2>Round ${this.currentRound}</h2>
        <p>${this.activePlayers.length} players remaining</p>
      `;
    }
    this.updatePlayersList();
  }

  updatePlayersList() {
    const playersList = this.container.querySelector('#players-list');
    if (playersList) {
      playersList.innerHTML = this.renderPlayersList();
    }
  }

  attachEventListeners() {
    const backBtn = this.container.querySelector('#back-to-selection');
    backBtn.addEventListener('click', () => {
      if (this.onTournamentEnd) {
        this.onTournamentEnd('back');
      }
    });
  }

  setOnTournamentEnd(callback) {
    this.onTournamentEnd = callback;
  }
}

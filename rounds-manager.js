import { heroes } from './heroes.js';
import { Combat } from './combat.js';
import { StatsCalculator } from './stats-calculator.js';

export class RoundsManager {
  constructor(container, playerHealth = null) {
    this.container = container;
    this.players = [];
    this.currentRound = 1;
    this.activePlayers = [];
    this.currentMatches = [];
    this.onTournamentEnd = null;
    this.combat = null;
    this.currentMatchIndex = 0;
    this.playerHealth = playerHealth;
  }

  init(userHero = null) {
    this.initializePlayers(userHero);
    this.render();
    this.startRound();
  }

  initializePlayers(userHero = null) {
    this.players = [];
    for (let i = 0; i < 8; i++) {
      let hero, playerName;
      if (i === 0 && userHero) {
        hero = { ...userHero };
        playerName = "You";
      } else {
        hero = heroes[Math.floor(Math.random() * heroes.length)];
        playerName = `Player ${i + 1}`;
      }
      
      const player = {
        id: i + 1,
        name: playerName,
        hero: hero,
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
    
    const userPlayerIndex = shuffled.findIndex(player => player.name === "You");
    if (userPlayerIndex > 0) {
      [shuffled[0], shuffled[userPlayerIndex]] = [shuffled[userPlayerIndex], shuffled[0]];
    }
    
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
    this.startSimultaneousMatches();
  }

  startSimultaneousMatches() {
    const userMatch = this.currentMatches.find(match => 
      match.player1.name === "You" || match.player2.name === "You"
    );
    
    const backgroundMatches = this.currentMatches.filter(match => 
      match.player1.name !== "You" && match.player2.name !== "You"
    );

    this.simulateBackgroundMatches(backgroundMatches);
    
    if (userMatch) {
      this.startBattle(userMatch.player1, userMatch.player2);
    } else {
      setTimeout(() => {
        this.processRoundResults();
      }, 3000);
    }
  }

  simulateBackgroundMatches(matches) {
    matches.forEach(match => {
      setTimeout(() => {
        const result = this.simulateBattle(match.player1, match.player2);
        this.processBattleResult(match.player1, match.player2, result, false);
      }, Math.random() * 2000 + 1000);
    });
  }

  simulateBattle(player1, player2) {
    const hero1Stats = StatsCalculator.processHeroStats(player1.hero);
    const hero2Stats = StatsCalculator.processHeroStats(player2.hero);
    
    const hero1Power = hero1Stats.effectiveStats.attack + hero1Stats.effectiveStats.speed + (hero1Stats.stats.health / 10);
    const hero2Power = hero2Stats.effectiveStats.attack + hero2Stats.effectiveStats.speed + (hero2Stats.stats.health / 10);
    
    const randomFactor = 0.8 + Math.random() * 0.4;
    const hero1Chance = (hero1Power * randomFactor) / (hero1Power + hero2Power);
    
    return Math.random() < hero1Chance ? 'victory' : 'defeat';
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

  processBattleResult(player1, player2, result, isUserMatch = true) {
    let match;
    if (isUserMatch) {
      match = this.currentMatches[this.currentMatchIndex];
    } else {
      match = this.currentMatches.find(m => 
        (m.player1 === player1 && m.player2 === player2) || 
        (m.player1 === player2 && m.player2 === player1)
      );
    }
    
    if (!match) return;
    
    if (result === 'victory') {
      match.winner = player1;
      player1.wins++;
      player2.health -= 25;
    } else {
      match.winner = player2;
      player2.wins++;
      player1.health -= 25;
    }
    
    if (isUserMatch && this.playerHealth) {
      if (player1.name === "You") {
        this.playerHealth.processRoundResult(result);
      } else if (player2.name === "You") {
        this.playerHealth.processRoundResult(result === 'victory' ? 'defeat' : 'victory');
      }
    }
    
    match.completed = true;
    this.updatePlayersList();
    
    if (isUserMatch) {
      this.currentMatchIndex++;
      setTimeout(() => {
        this.checkRoundCompletion();
      }, 2000);
    } else {
      this.checkRoundCompletion();
    }
  }

  checkRoundCompletion() {
    const allMatchesCompleted = this.currentMatches.every(match => match.completed);
    if (allMatchesCompleted) {
      setTimeout(() => {
        this.processRoundResults();
      }, 1000);
    }
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
    return this.players.map(player => {
      let currentHealth, maxHealth, healthPercentage;
      
      if (player.name === "You" && this.playerHealth) {
        currentHealth = this.playerHealth.currentHealth;
        maxHealth = 50;
        healthPercentage = (currentHealth / maxHealth) * 100;
      } else {
        const scaledHealth = Math.round((player.health / 100) * 50);
        currentHealth = scaledHealth;
        maxHealth = 50;
        healthPercentage = (scaledHealth / 50) * 100;
      }
      
      return `
        <div class="player-card ${player.isEliminated ? 'eliminated' : ''} ${this.activePlayers.includes(player) ? 'active' : ''}">
          <div class="player-info">
            <div class="player-name">${player.name}</div>
            <div class="player-hero">${player.hero.avatar} ${player.hero.name}</div>
          </div>
          <div class="player-health">
            <div class="health-bar">
              <div class="health-fill" style="width: ${healthPercentage}%"></div>
              <span class="health-text">${currentHealth}/${maxHealth}</span>
            </div>
          </div>
          <div class="player-stats">
            <span class="wins">Wins: ${player.wins}</span>
          </div>
        </div>
      `;
    }).join('');
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

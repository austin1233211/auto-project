import { heroes } from './heroes.js';
import { Combat } from './combat.js';
import { StatsCalculator } from './stats-calculator.js';
import { PlayerHealth } from './player-health.js';
import { Timer } from './timer.js';
import { Economy } from './economy.js';
import { CombatShop } from './combat-shop-v2.js';

export class RoundsManager {
  constructor(container, playerHealth = null) {
    this.container = container;
    this.players = [];
    this.currentRound = 1;
    this.activePlayers = [];
    this.ghostPlayers = [];
    this.currentMatches = [];
    this.onTournamentEnd = null;
    this.combat = null;
    this.currentMatchIndex = 0;
    this.playerHealth = playerHealth;
    this.timer = new Timer();
    this.economy = new Economy();
    this.roundsShop = null;
    this.roundsShopContainer = null;
    this.setupTimer();
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
        playerHealth: i === 0 && userHero && this.playerHealth ? this.playerHealth : new PlayerHealth(),
        isEliminated: false,
        wins: 0,
        losses: 0,
        gold: 300,
        consecutiveWins: 0,
        consecutiveLosses: 0
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
    
    if (shuffled.length % 2 === 1 && this.ghostPlayers.length > 0) {
      const randomGhost = this.ghostPlayers[Math.floor(Math.random() * this.ghostPlayers.length)];
      shuffled.push(randomGhost);
    }
    
    for (let i = 0; i < shuffled.length; i += 2) {
      if (shuffled[i + 1]) {
        matches.push({
          player1: shuffled[i],
          player2: shuffled[i + 1],
          winner: null,
          completed: false
        });
      }
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
    
    this.timer.startBuffer(() => {
      this.startSimultaneousMatches();
    });
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
    this.combat.init(player1.hero, player1.gold || 0);
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
    
    if (!match || match.completed) return;
    
    if (result === 'victory') {
      match.winner = player1;
      if (!player1.isGhost) {
        player1.wins++;
        const oldHealth = player1.playerHealth.currentHealth;
        player1.playerHealth.processRoundResult('victory');
        this.economy.awardMoney(player1, true, 0);
      }
      if (!player2.isGhost) {
        const oldHealth = player2.playerHealth.currentHealth;
        player2.playerHealth.processRoundResult('defeat');
        const hpLost = oldHealth - player2.playerHealth.currentHealth;
        this.economy.awardMoney(player2, false, hpLost);
      }
    } else {
      match.winner = player2;
      if (!player2.isGhost) {
        player2.wins++;
        const oldHealth = player2.playerHealth.currentHealth;
        player2.playerHealth.processRoundResult('victory');
        this.economy.awardMoney(player2, true, 0);
      }
      if (!player1.isGhost) {
        const oldHealth = player1.playerHealth.currentHealth;
        player1.playerHealth.processRoundResult('defeat');
        const hpLost = oldHealth - player1.playerHealth.currentHealth;
        this.economy.awardMoney(player1, false, hpLost);
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
    this.timer.stopTimer();
    
    const newlyEliminated = this.activePlayers.filter(player => player.playerHealth.currentHealth <= 0);
    newlyEliminated.forEach(player => {
      player.isEliminated = true;
      const ghostPlayer = {
        ...player,
        name: `👻 Ghost of ${player.name.replace('👻 Ghost of ', '')}`,
        isGhost: true,
        playerHealth: { currentHealth: 0, maxHealth: 50 },
        losses: 0
      };
      this.ghostPlayers.push(ghostPlayer);
    });

    this.activePlayers = this.activePlayers.filter(player => player.playerHealth.currentHealth > 0);

    if (this.activePlayers.length > 1) {
      this.currentRound++;
      
      setTimeout(() => {
        this.startInterRoundTimer();
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
            <p>${this.activePlayers.length} players remaining${this.ghostPlayers.length > 0 ? ` (${this.ghostPlayers.length} ghosts available)` : ''}</p>
            <div id="round-timer" class="round-timer">
              <div class="timer-display">Preparing round...</div>
            </div>
          </div>
          <div id="battle-area" class="battle-area">
            <!-- Combat will be rendered here -->
          </div>
          <div class="tournament-controls">
            <button class="action-button secondary" id="back-to-selection" style="display: none;">Back to Hero Selection</button>
          </div>
        </div>
        
        <div class="players-sidebar">
          <h3>Players</h3>
          <div class="players-list" id="players-list">
            ${this.renderPlayersList()}
          </div>
        </div>
        
        <button class="combat-shop-toggle" id="rounds-shop-toggle" style="display: none;">🏪</button>
        <div id="rounds-shop-container" class="combat-shop-container"></div>
      </div>
    `;

    this.attachEventListeners();
    this.initRoundsShop();
  }

  renderPlayersList() {
    const allPlayers = [...this.players, ...this.ghostPlayers];
    return allPlayers.map(player => {
      const currentHealth = player.playerHealth.currentHealth;
      const maxHealth = player.playerHealth.maxHealth;
      const healthPercentage = (currentHealth / maxHealth) * 100;
      
      return `
        <div class="player-card ${player.isEliminated ? 'eliminated' : ''} ${player.isGhost ? 'ghost' : ''} ${this.activePlayers.includes(player) ? 'active' : ''}">
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
            <span class="losses">Losses: ${player.losses}</span>
            <span class="gold">💰 ${player.gold || 0}</span>
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
        <p>${this.activePlayers.length} players remaining${this.ghostPlayers.length > 0 ? ` (${this.ghostPlayers.length} ghosts available)` : ''}</p>
        <div id="round-timer" class="round-timer">
          <div class="timer-display">Preparing round...</div>
        </div>
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
    const shopToggleBtn = this.container.querySelector('#rounds-shop-toggle');
    
    backBtn.addEventListener('click', () => {
      if (this.onTournamentEnd) {
        this.onTournamentEnd('back');
      }
    });

    if (shopToggleBtn) {
      shopToggleBtn.addEventListener('click', () => {
        if (this.roundsShop) {
          this.roundsShop.toggle();
        }
      });
    }
  }

  setupTimer() {
    this.timer.setOnTimerUpdate((timerData) => {
      this.updateTimerDisplay(timerData);
      if (this.combat && timerData.damageMultiplier) {
        this.combat.setDamageMultiplier(timerData.damageMultiplier);
      }
    });

    this.timer.setOnRoundEnd(() => {
      if (this.combat) {
        this.combat.endBattle('timeout');
      } else {
        this.processRoundResults();
      }
    });

    this.timer.setOnSpeedBoost((isActive) => {
      if (this.combat) {
        this.combat.setSpeedMultiplier(isActive ? 4 : 1);
      }
    });

    this.timer.setOnDamageEscalation((isActive) => {
    });
  }

  updateTimerDisplay(timerData) {
    const timerElement = this.container.querySelector('#round-timer');
    if (timerElement) {
      const minutes = Math.floor(timerData.time / 60);
      const seconds = timerData.time % 60;
      const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      if (timerData.isBuffer) {
        timerElement.innerHTML = `<div class="timer-display buffer">Pre-Round: ${timeString}</div>`;
        this.showRoundsShop();
        this.updateRoundsShopMoney();
      } else {
        const speedBoostClass = timerData.speedBoost ? ' speed-boost' : '';
        const damageEscalationClass = timerData.damageEscalation ? ' damage-escalation' : '';
        const multiplierText = timerData.damageMultiplier > 1 ? ` (${(timerData.damageMultiplier * 100).toFixed(0)}% damage)` : '';
        timerElement.innerHTML = `<div class="timer-display round${speedBoostClass}${damageEscalationClass}">Round Timer: ${timeString}${multiplierText}</div>`;
        this.hideRoundsShop();
      }
    }
  }

  setOnTournamentEnd(callback) {
    this.onTournamentEnd = callback;
  }


  initRoundsShop() {
    this.roundsShopContainer = this.container.querySelector('#rounds-shop-container');
    if (this.roundsShopContainer) {
      const userPlayer = this.players.find(p => p.name === "You");
      const playerGold = userPlayer ? userPlayer.gold : 300;
      
      this.roundsShop = new CombatShop(this.roundsShopContainer, null, this.currentRound);
      this.roundsShop.setPlayerGold(playerGold);
      this.roundsShop.setOnGoldChange((newGold) => {
        if (userPlayer) {
          userPlayer.gold = newGold;
          this.updatePlayersList();
        }
      });
      this.roundsShop.init();
    }
  }

  showRoundsShop() {
    const shopToggle = this.container.querySelector('#rounds-shop-toggle');
    if (shopToggle) {
      shopToggle.style.display = 'block';
    }
  }

  hideRoundsShop() {
    const shopToggle = this.container.querySelector('#rounds-shop-toggle');
    if (shopToggle) {
      shopToggle.style.display = 'none';
    }
    if (this.roundsShop) {
      this.roundsShop.hide();
    }
  }

  updateRoundsShopMoney() {
    if (this.roundsShop) {
      const userPlayer = this.players.find(p => p.name === "You");
      if (userPlayer) {
        this.roundsShop.setPlayerGold(userPlayer.gold);
        this.roundsShop.updateGoldDisplay();
      }
    }
  }

  startInterRoundTimer() {
    this.showRoundsShop();
    this.updateRoundsShopMoney();
    
    this.timer.startBuffer(() => {
      this.hideRoundsShop();
      this.startRound();
    });
  }
}

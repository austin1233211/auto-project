import { heroes } from '../core/heroes.js';
import { Combat } from './combat.js';
import { StatsCalculator } from '../core/stats-calculator.js';
import { PlayerHealth } from '../ui/player-health.js';
import { Timer } from './timer.js';
import { Economy } from '../shops/economy.js';
import { CombatShop } from '../shops/combat-shop-v2.js';
import { MinionCombat } from './minion-combat.js';
import { ArtifactsShop } from '../shops/artifacts-shop.js';
import { EquipmentReward } from '../components/equipment-reward.js';
import { ArtifactSystem } from '../core/artifacts.js';
import { ArtifactEffects } from '../core/artifact-effects.js';
import { debugTools } from '../components/debug-tools.js';
import { PLAYER_CONSTANTS } from '../core/constants.js';

export class RoundsManager {
  constructor(container, playerHealth = null, heroStatsCard = null) {
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
    this.heroStatsCard = heroStatsCard;
    this.timer = new Timer();
    this.economy = new Economy();
    this.roundsShop = null;
    this.roundsShopContainer = null;
    this.userBattleCompleted = false;
    this.artifactSystem = new ArtifactSystem();
    this.isSpecialRound = false;
    this.artifactSelectionShown = false;
    this.isArtifactSelectionActive = false;
    this.isProcessingRoundResults = false;
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
        gold: PLAYER_CONSTANTS.STARTING_GOLD,
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
    try {
      console.log(`Starting round ${this.currentRound}, active players: ${this.activePlayers.length}`);
      
      if (this.isArtifactSelectionActive) {
        console.log('Artifact selection is active, preventing startRound()');
        return;
      }
      
      if (this.activePlayers.length <= 1) {
        this.endTournament();
        return;
      }
      
      if ([5, 10, 15, 20].includes(this.currentRound)) {
        this.startMinionRound();
        return;
      }
      
      if ([3, 8, 13].includes(this.currentRound)) {
        if (!this.isArtifactSelectionActive) {
          this.startArtifactRound();
        }
        return;
      }
      
      this.isSpecialRound = [3, 8, 13].includes(this.currentRound);
      this.currentMatches = this.generateMatches();
      this.currentMatchIndex = 0;
      this.userBattleCompleted = false;
      this.isProcessingRoundResults = false;
      this.updateRoundDisplay();
      
      this.timer.startBuffer(() => {
        this.hideRoundsShop();
        this.timer.startRound();
        this.startSimultaneousMatches();
      });
    } catch (error) {
      console.error('RoundsManager.startRound error:', error);
    }
  }

  startSimultaneousMatches() {
    if (this.isArtifactSelectionActive) {
      console.log('Artifact selection is active, preventing startSimultaneousMatches()');
      return;
    }
    
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
    if (this.isArtifactSelectionActive) {
      console.log('Artifact selection is active, preventing simulateBackgroundMatches()');
      return;
    }
    
    debugTools.startProcess(`bg_matches_round_${this.currentRound}`, `${matches.length} background matches for round ${this.currentRound}`, 5000);
    
    matches.forEach((match, index) => {
      const delay = Math.random() * 2000 + 1000;
      
      const matchId = debugTools.monitorBackgroundMatch(index, match.player1.name, match.player2.name, delay);
      
      setTimeout(() => {
        const result = this.simulateBattle(match.player1, match.player2);
        this.processBattleResult(match.player1, match.player2, result, false);
        debugTools.endProcess(matchId);
      }, delay);
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
    
    if (this.combat) {
      this.combat.clearTimers();
      this.combat = null;
    }
    
    this.combat = new Combat(combatContainer, this.heroStatsCard);
    
    this.combat.setOnBattleEnd((result) => {
      this.endBattle(result, player1, player2);
    });
    
    const userPlayer = this.players.find(p => p.name === "You");
    if (userPlayer) {
      this.combat.setOnAbilityPurchased(() => {
        if (userPlayer && this.combat && this.combat.combatShop) {
          userPlayer.hero = this.combat.combatShop.applyItemsToHero(userPlayer.hero);
          this.updatePlayerHero();
        }
      });
    }

    this.combat.setOnMoneyChange((newMoney) => {
      if (player1.name === "You") {
        player1.gold = newMoney;
        this.updatePlayersList();
      }
    });

    this.combat.selectRandomEnemy = () => ({ ...player2.hero });
    this.combat.init(player1.hero, player1.gold || 0);
    
    if (player1.name === "You" && this.combat.combatShop) {
      this.combat.combatShop.setPlayer(player1);
    }
    
    if (this.heroStatsCard && player1.name === "You") {
      this.heroStatsCard.updateHero(player1.hero);
    }
  }

  endBattle(result, player1, player2) {
    if (this.combat) {
      this.combat.clearTimers();
    }
    
    if ([5, 10, 15, 20].includes(this.currentRound)) {
      this.handleSpecialRoundResult(result);
      return;
    }
    
    this.processBattleResult(player1, player2, result);
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
        const processedHero = StatsCalculator.processHeroStats(player1.hero);
        this.economy.awardMoney(player1, true, 0, processedHero.effectiveStats.goldBonus || 0);
        
        const artifactGold = ArtifactEffects.processVictoryEffects(player1, player2, this.players);
        if (artifactGold > 0) {
          player1.gold += artifactGold;
        }
      }
      if (!player2.isGhost) {
        const oldHealth = player2.playerHealth.currentHealth;
        player2.playerHealth.processRoundResult('defeat');
        const hpLost = oldHealth - player2.playerHealth.currentHealth;
        this.economy.awardMoney(player2, false, hpLost);
        
        const artifactGold = ArtifactEffects.processDefeatEffects(player2, hpLost);
        if (artifactGold > 0) {
          player2.gold += artifactGold;
        }
      }
    } else {
      match.winner = player2;
      if (!player2.isGhost) {
        player2.wins++;
        const oldHealth = player2.playerHealth.currentHealth;
        player2.playerHealth.processRoundResult('victory');
        const processedHero = StatsCalculator.processHeroStats(player2.hero);
        this.economy.awardMoney(player2, true, 0, processedHero.effectiveStats.goldBonus || 0);
        
        const artifactGold = ArtifactEffects.processVictoryEffects(player2, player1, this.players);
        if (artifactGold > 0) {
          player2.gold += artifactGold;
        }
      }
      if (!player1.isGhost) {
        const oldHealth = player1.playerHealth.currentHealth;
        player1.playerHealth.processRoundResult('defeat');
        const hpLost = oldHealth - player1.playerHealth.currentHealth;
        this.economy.awardMoney(player1, false, hpLost);
        
        const artifactGold = ArtifactEffects.processDefeatEffects(player1, hpLost);
        if (artifactGold > 0) {
          player1.gold += artifactGold;
        }
      }
    }
    
    match.completed = true;
    this.updatePlayersList();
    
    if (isUserMatch) {
      this.userBattleCompleted = true;
      this.currentMatchIndex++;
      
      if ([3, 8, 13].includes(this.currentRound) && !this.artifactSelectionShown) {
        console.log(`User battle completed on artifact round ${this.currentRound}, showing artifact selection`);
        this.artifactSelectionShown = true;
        setTimeout(() => {
          this.startArtifactRound();
        }, 2000);
        return; // Don't check round completion yet, artifact selection will handle progression
      }
    const userPlayerForUrn = this.players.find(p => p.name === 'You');
    if (userPlayerForUrn && userPlayerForUrn.hero && userPlayerForUrn.hero.persistentEffects) {
      if (typeof userPlayerForUrn.hero.persistentEffects.urnBattlesCounter === 'number') {
        userPlayerForUrn.hero.persistentEffects.urnBattlesCounter += 1;
        if (userPlayerForUrn.hero.persistentEffects.urnBattlesCounter >= 5) {
          userPlayerForUrn.hero.persistentEffects.urnPoisonIncrement = (userPlayerForUrn.hero.persistentEffects.urnPoisonIncrement || 0) + 3;
          userPlayerForUrn.hero.persistentEffects.urnBattlesCounter = 0;
        }
      }
    }
      
      setTimeout(() => {
        this.checkRoundCompletion();
      }, 2000);
    } else {
      this.checkRoundCompletion();
    }
  }

  checkRoundCompletion() {
    const completedMatches = this.currentMatches.filter(match => match.completed).length;
    const totalMatches = this.currentMatches.length;
    
    if (this.isProcessingRoundResults) {
      console.log(`Already processing round results for round ${this.currentRound}, skipping`);
      return;
    }
    
    this.isProcessingRoundResults = true;
    
    if ([3, 8, 13].includes(this.currentRound) && this.artifactSelectionShown) {
      console.log(`Artifact selection is active for round ${this.currentRound}, skipping round completion`);
      this.isProcessingRoundResults = false;
      return;
    }
    
    const allMatchesCompleted = this.currentMatches.every(match => match.completed);
    if (allMatchesCompleted) {
      console.log(`All matches completed for round ${this.currentRound}, processing results`);
      setTimeout(() => {
        this.processRoundResults();
      }, 1000);
    } else {
      console.log(`Still waiting for ${totalMatches - completedMatches} matches to complete`);
      this.isProcessingRoundResults = false;
    }
  }

  processRoundResults() {
    debugTools.logDebug(`🏁 Processing round ${this.currentRound} results`);
    debugTools.validateBattleState(this.currentRound, this.userBattleCompleted, this.currentMatches, this.activePlayers);
    
    this.timer.stopTimer();
    
    if (this.combat) {
      this.combat.clearTimers();
      this.combat = null;
    }
    
    debugTools.endProcess(`bg_matches_round_${this.currentRound}`);
    
    this.players.forEach(player => {
      if (player.playerHealth.currentHealth <= 0 && !player.isEliminated) {
        const rescueResult = ArtifactEffects.processUltimateRescue(player);
        if (rescueResult.rescued) {
          player.playerHealth.currentHealth = 1;
          player.gold += rescueResult.gold;
        }
      }
    });
    
    const eliminationCount = this.players.filter(p => p.isEliminated).length;
    
    const newlyEliminated = this.activePlayers.filter(player => player.playerHealth.currentHealth <= 0);
    newlyEliminated.forEach(player => {
      player.isEliminated = true;
      const cleanName = player.name.replace(/^(👻 Ghost of )+/, '');
      const ghostPlayer = {
        ...player,
        name: `👻 Ghost of ${cleanName}`,
        isGhost: true,
        playerHealth: { currentHealth: 0, maxHealth: PLAYER_CONSTANTS.MAX_HEALTH },
        losses: 0
      };
      this.ghostPlayers.push(ghostPlayer);
    });
    
    this.players.forEach(player => {
      if (!player.isEliminated && eliminationCount < this.players.filter(p => p.isEliminated).length) {
        const hpRestore = ArtifactEffects.processUrnOfSoul(player, this.players);
        if (hpRestore > 0) {
          player.playerHealth.currentHealth = Math.min(
            player.playerHealth.maxHealth,
            player.playerHealth.currentHealth + hpRestore
          );
        }
      }
    });

    this.activePlayers = this.activePlayers.filter(player => player.playerHealth.currentHealth > 0);

    if (this.activePlayers.length > 1) {
      const oldRound = this.currentRound;
      this.currentRound++;
      this.artifactSelectionShown = false; // Reset for next artifact round
      this.isProcessingRoundResults = false; // Reset flag for next round
      
      debugTools.logRoundTransition(oldRound, this.currentRound, 'Round completed', this.activePlayers.length);
      debugTools.generateTestReport(oldRound);
      
      setTimeout(() => {
        this.startInterRoundTimer();
      }, 3000);
    } else {
      debugTools.logDebug('🏆 Tournament ending - only 1 player remaining');
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
            <button class="action-button danger" id="quit-tournament">Quit Tournament</button>
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
        const damageEscalationClass = timerData.damageEscalation ? ' damage-escalation' : '';
        const multiplierText = timerData.damageMultiplier > 1 ? ` (${(timerData.damageMultiplier * 100).toFixed(0)}% damage)` : '';
        
        if (this.userBattleCompleted) {
          timerElement.innerHTML = `<div class="timer-display completed">Your Battle Complete - Others Fighting: ${timeString}${multiplierText}</div>`;
        } else {
          timerElement.innerHTML = `<div class="timer-display round${damageEscalationClass}">Round Timer: ${timeString}${multiplierText}</div>`;
        }
        this.hideRoundsShop();
      }
    }
  }

  setOnTournamentEnd(callback) {
    this.onTournamentEnd = callback;
  }


  initRoundsShop() {
    if ([3, 8, 13].includes(this.currentRound)) {
      return;
    }
    
    this.roundsShopContainer = this.container.querySelector('#rounds-shop-container');
    if (this.roundsShopContainer) {
      const userPlayer = this.players.find(p => p.name === "You");
      const playerGold = userPlayer ? userPlayer.gold : PLAYER_CONSTANTS.STARTING_GOLD;
      
      this.roundsShop = new CombatShop(this.roundsShopContainer, null, this.currentRound);
      if (userPlayer) {
        this.roundsShop.setPlayer(userPlayer);
      }
      this.roundsShop.setPlayerGold(playerGold);
      this.roundsShop.setOnGoldChange((newGold) => {
        if (userPlayer) {
          userPlayer.gold = newGold;
          this.updatePlayersList();
          this.updatePlayerHero();
        }
      });
      
      this.roundsShop.setOnAbilityPurchased(() => {
        if (userPlayer) {
          userPlayer.hero = this.roundsShop.applyItemsToHero(userPlayer.hero);
          this.updatePlayerHero();
        }
      });
      this.roundsShop.init();
      this.roundsShop.checkAndShowTier3Selection();
    }
  }

  showRoundsShop() {
    if ([3, 8, 13].includes(this.currentRound)) {
      return;
    }
    
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
    if (this.isArtifactSelectionActive) {
      console.log('Artifact selection is active, preventing startInterRoundTimer()');
      return;
    }
    
    const userPlayerForMaple = this.players.find(p => p.name === 'You');
    if (userPlayerForMaple && userPlayerForMaple.hero && userPlayerForMaple.hero.persistentEffects && typeof userPlayerForMaple.hero.persistentEffects.mapleSyrupStacks === 'number') {
      if (this.currentRound % 5 === 0) {
        userPlayerForMaple.hero.persistentEffects.mapleSyrupStacks += 1;
        this.updatePlayerHero();
      }
    }
    
    const userPlayerForSoul = this.players.find(p => p.name === 'You');
    if (userPlayerForSoul && userPlayerForSoul.hero && userPlayerForSoul.hero.persistentEffects) {
      const pe = userPlayerForSoul.hero.persistentEffects;
      if (typeof pe.soulBoosterHpPerRound === 'number') {
        pe.soulBoosterAccum = (pe.soulBoosterAccum || 0) + pe.soulBoosterHpPerRound;
        userPlayerForSoul.hero.stats.health += pe.soulBoosterHpPerRound;
        this.updatePlayerHero();
      }
    }
    
    this.players.forEach(player => {
      ArtifactEffects.processRoundEnd(player);
      
      const roundStartGold = ArtifactEffects.processRoundStartEffects(player, this.currentRound, this.players);
      if (roundStartGold > 0) {
        player.gold += roundStartGold;
      }
      
      const loanPenalty = ArtifactEffects.getLoanPenalty(player);
      if (loanPenalty > 0) {
        player.gold = Math.max(0, player.gold - loanPenalty);
      }
      ArtifactEffects.decrementLoanRounds(player);
    });
    
    this.updatePlayersList();
    
    // Setup for the next round
    if ([5, 10, 15, 20].includes(this.currentRound)) {
      this.startMinionRound();
      return;
    }
    
    if ([3, 8, 13].includes(this.currentRound) && !this.artifactSelectionShown) {
      this.artifactSelectionShown = true;
      this.startArtifactRound();
      return;
    }
    
    this.isSpecialRound = [3, 8, 13].includes(this.currentRound);
    this.currentMatches = this.generateMatches();
    this.currentMatchIndex = 0;
    this.userBattleCompleted = false;
    this.isProcessingRoundResults = false;
    this.updateRoundDisplay();
    
    this.showRoundsShop();
    this.updateRoundsShopMoney();
    
    if (this.roundsShop && this.roundsShop.resetForNewRound) {
      this.roundsShop.resetForNewRound();
    }
    
    this.timer.startBuffer(() => {
      this.hideRoundsShop();
      this.timer.startRound();
      this.startSimultaneousMatches();
    });
  }

  startMinionRound() {
    console.log(`Starting minion round ${this.currentRound}`);
    this.isSpecialRound = true;
    this.updateRoundDisplay();
    
    const combatContainer = this.container.querySelector('#battle-area');
    if (combatContainer) {
      console.log('Combat container found, creating MinionCombat');
      const minionCombat = new MinionCombat(combatContainer, this.heroStatsCard);
      
      minionCombat.setOnBattleEnd((result) => {
        this.handleMinionBattleResult(result);
      });
      
      const userPlayer = this.players.find(p => p.name === "You");
      if (userPlayer) {
        console.log('User player found, initializing minion combat');
        minionCombat.init(userPlayer.hero, userPlayer.gold, this.currentRound);
      } else {
        console.log('User player not found!');
      }
    } else {
      console.log('Combat container not found!');
    }
  }

  startArtifactRound() {
    this.isSpecialRound = true;
    this.isArtifactSelectionActive = true;
    this.updateRoundDisplay();
    
    window.currentPlayers = this.players;
    
    const combatContainer = this.container.querySelector('#battle-area');
    if (combatContainer) {
      if (this.combat) {
        this.combat.clearTimers();
        this.combat = null;
      }
      
      combatContainer.innerHTML = '';
      
      setTimeout(() => {
        const artifactsShop = new ArtifactsShop(combatContainer, this.currentRound);
        
        artifactsShop.setOnArtifactSelected((artifact) => {
          this.handleArtifactSelection(artifact);
        });
        
        artifactsShop.init();
      }, 100);
    }
  }

  handleMinionBattleResult(result) {
    const combatContainer = this.container.querySelector('#battle-area');
    if (combatContainer) {
      const equipmentReward = new EquipmentReward(combatContainer);
      
      equipmentReward.setOnEquipmentSelected((equipment) => {
        this.handleEquipmentSelection(equipment);
      });
      
      equipmentReward.init(result.playerWon, this.currentRound);
    }
  }

  handleArtifactSelection(artifact) {
    if (!this.isArtifactSelectionActive) {
      console.warn('handleArtifactSelection called but artifact selection not active');
      return;
    }
    
    const userPlayer = this.players.find(p => p.name === "You");
    if (userPlayer) {
      userPlayer.hero = this.artifactSystem.applyArtifactToHero(userPlayer.hero, artifact);
      
      if (artifact.effect === 'parasite' && artifact.parasiteTargetId) {
        userPlayer.hero.persistentEffects.parasiteTargetId = artifact.parasiteTargetId;
      }
      
      if (artifact.effect === 'new_years_gift') {
        userPlayer.gold += artifact.value;
        this.updatePlayersList();
      }
      
      if (artifact.effect === 'loan_agreement') {
        userPlayer.gold += artifact.value;
        this.updatePlayersList();
      }
      
      if (artifact.effect === 'fate') {
        userPlayer.gold += artifact.value;
        this.updatePlayersList();
      }
      
      if (artifact.effect === 'loan_agreement_2') {
        userPlayer.gold += artifact.value;
        this.updatePlayersList();
      }
      
      if (artifact.effect === 'new_years_gift_2') {
        userPlayer.gold += artifact.value;
        this.updatePlayersList();
      }
      
      if (artifact.effect === 'loan_agreement_3') {
        userPlayer.gold += artifact.value;
        this.updatePlayersList();
      }
      
      this.updatePlayerHero();
    }
    
    const combatContainer = this.container.querySelector('#battle-area');
    if (combatContainer) {
      combatContainer.innerHTML = '';
    }
    
    this.isArtifactSelectionActive = false;
    this.currentRound++;
    
    setTimeout(() => {
      this.startInterRoundTimer();
    }, 3000);
  }

  handleEquipmentSelection(equipment) {
    const userPlayer = this.players.find(p => p.name === "You");
    if (userPlayer) {
      if (!userPlayer.hero.equipment) {
        userPlayer.hero.equipment = [];
      }
      userPlayer.hero.equipment.push(equipment);
      if (!userPlayer.hero.persistentEffects) {
        userPlayer.hero.persistentEffects = {};
      }
      if (equipment && equipment.type === 'maple_syrup') {
        if (userPlayer.hero.persistentEffects.mapleSyrupStacks == null) {
          userPlayer.hero.persistentEffects.mapleSyrupStacks = 1;
        }
      }
      if (equipment && equipment.type === 'urn_of_shadows') {
        if (userPlayer.hero.persistentEffects.urnPoisonIncrement == null) {
          userPlayer.hero.persistentEffects.urnPoisonIncrement = 0;
          userPlayer.hero.persistentEffects.urnBattlesCounter = 0;
        }
      }
      if (equipment && equipment.type === 'soul_booster') {
        userPlayer.hero.persistentEffects.soulBoosterHpPerRound = (equipment.effects && equipment.effects.perRoundHpGain) ? equipment.effects.perRoundHpGain : 30;
        userPlayer.hero.persistentEffects.soulBoosterAccum = (userPlayer.hero.persistentEffects.soulBoosterAccum || 0);
      }
      this.updatePlayerHero();
    }
    
    const combatContainer = this.container.querySelector('#battle-area');
    if (combatContainer) {
      combatContainer.innerHTML = '';
    }
    this.isArtifactSelectionActive = false;
    
    this.processRoundResults();
  }

  handleSpecialRoundResult(result) {
    this.processRoundResults();
  }

  updatePlayerHero() {
    const userPlayer = this.players.find(p => p.name === "You");
    if (userPlayer && this.heroStatsCard) {
      this.heroStatsCard.updateHero(userPlayer.hero);
    }
  }
}

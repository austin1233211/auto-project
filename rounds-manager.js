import { Combat } from './combat.js';
import { StatsCalculator } from './stats-calculator.js';
import { PlayerHealth } from './player-health.js';
import { Timer } from './timer.js';
import { Economy } from './economy.js';
import { CombatShop } from './combat-shop-v2.js';
import { MinionCombat } from './minion-combat.js';
import { ArtifactsShop } from './artifacts-shop.js';
import { EquipmentReward } from './equipment-reward.js';
import { ArtifactSystem } from './artifacts.js';
import { debugTools } from './debug-tools.js';

export class RoundsManager {
  constructor(container, playerHealth = null, heroStatsCard = null) {
    this.container = container;
    this.tournament = null;
    this.currentTournament = null;
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

  async init(userHero = null, tournament = null) {
    this.currentTournament = tournament;
    this.userHero = userHero;
    
    if (this.players.length === 0) {
      await this.loadTournamentState();
    }
    
    this.render();
    this.startRound();
  }

  getHeroAvatar(heroClass) {
    const avatars = {
      'Warrior': '⚔️',
      'Mage': '🔮',
      'Archer': '🏹',
      'Assassin': '🗡️',
      'Paladin': '🛡️',
      'Berserker': '🪓',
      'Necromancer': '💀',
      'Druid': '🌿',
      'Intelligence': '🔮',
      'Agility': '🏹',
      'Strength': '⚔️'
    };
    return avatars[heroClass] || '⚔️';
  }

  async loadTournamentState() {
    console.log('=== loadTournamentState called ===');
    try {
      if (this.currentTournament) {
        console.log('=== Current Tournament ===', this.currentTournament);
        const tournamentData = await apiClient.getTournament(this.currentTournament.id);
        console.log('=== Server Tournament Data ===', tournamentData);
        this.tournament = tournamentData.tournament;
        
        if (tournamentData.tournament && tournamentData.tournament.players) {
          console.log('=== Server Players Data ===', tournamentData.tournament.players);
          console.log('=== First Player Structure ===', tournamentData.tournament.players[0]);
        }
        
        this.players = (tournamentData.tournament && tournamentData.tournament.players || []).map(serverPlayer => {
          console.log('=== Mapping Server Player ===', serverPlayer);
          const isCurrentUser = serverPlayer.username === 'testuser'; // Mark current user
          const mappedPlayer = {
            id: serverPlayer.id || serverPlayer.player_id,
            name: isCurrentUser ? 'You' : (serverPlayer.username || 'Player'), // Use "You" for current user
            hero: {
              name: serverPlayer.hero_name || 'Unknown Hero',
              class: serverPlayer.hero_class || 'Unknown',
              avatar: this.getHeroAvatar(serverPlayer.hero_class || 'Unknown'),
              stats: {
                health: parseFloat(serverPlayer.base_health) || 100,
                attack: parseFloat(serverPlayer.base_attack) || 25,
                armor: parseFloat(serverPlayer.base_armor) || 0,
                speed: parseFloat(serverPlayer.base_speed) || 1.0,
                critChance: 0.05,
                critDamage: 1.5,
                evasionChance: 0.05,
                evasionDamageReduction: 0.5,
                magicDamageReduction: 0,
                physicalDamageAmplification: 0,
                magicDamageAmplification: 0,
                manaRegeneration: 0,
                attackSpeed: 0
              },
              abilities: {
                passive: {
                  name: serverPlayer.passive_ability_name || 'Unknown',
                  description: 'Passive ability'
                },
                ultimate: {
                  name: serverPlayer.ultimate_ability_name || 'Unknown',
                  description: 'Ultimate ability'
                }
              }
            },
            playerHealth: {
              currentHealth: serverPlayer.current_health || 50,
              maxHealth: serverPlayer.max_health || 50
            },
            isEliminated: serverPlayer.is_eliminated || false,
            wins: serverPlayer.consecutive_wins || 0,
            losses: serverPlayer.consecutive_losses || 0,
            gold: serverPlayer.gold || 300,
            consecutiveWins: serverPlayer.consecutive_wins || 0,
            consecutiveLosses: serverPlayer.consecutive_losses || 0,
            isCurrentUser: isCurrentUser
          };
          console.log('=== Mapped Player ===', mappedPlayer);
          return mappedPlayer;
        });
        
        console.log('=== Final Players Array ===', this.players);
        
        this.currentRound = this.tournament.current_round || 1;
        this.activePlayers = this.players.filter(p => !p.isEliminated);
        
        const matchesData = await apiClient.getMatches(this.currentTournament.id);
        this.currentMatches = matchesData.matches || [];
      } else {
        console.log('=== No current tournament ===');
      }
    } catch (error) {
      console.error('Failed to load tournament state:', error);
    }
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
    console.log('=== generateMatches called ===');
    console.log('=== this.activePlayers ===', this.activePlayers);
    console.log('=== this.activePlayers length ===', this.activePlayers.length);
    if (this.activePlayers.length > 0) {
      console.log('=== First active player ===', this.activePlayers[0]);
    }
    
    const shuffled = [...this.activePlayers].sort(() => Math.random() - 0.5);
    console.log('=== shuffled array ===', shuffled);
    
    const userPlayerIndex = shuffled.findIndex(player => {
      console.log('=== Checking player in findIndex ===', player);
      try {
        return player && player.name && (player.name === "You" || player.name === "testuser" || player.isCurrentUser);
      } catch (error) {
        console.error('=== ERROR IN FINDINDEX PLAYER CHECK ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        console.error('Player object:', player);
        throw error;
      }
    });
    if (userPlayerIndex > 0) {
      [shuffled[0], shuffled[userPlayerIndex]] = [shuffled[userPlayerIndex], shuffled[0]];
    }
    
    const matches = [];
    
    if (shuffled.length % 2 === 1 && this.ghostPlayers.length > 0) {
      const randomGhost = this.ghostPlayers[Math.floor(Math.random() * this.ghostPlayers.length)];
      shuffled.push(randomGhost);
    }
    
    for (let i = 0; i < shuffled.length; i += 2) {
      try {
        if (shuffled[i + 1] && shuffled[i] && shuffled[i].name && shuffled[i + 1].name) {
          matches.push({
            player1: shuffled[i],
            player2: shuffled[i + 1],
          winner: null,
          completed: false
        });
        }
      } catch (error) {
        console.error('=== ERROR IN MATCH GENERATION LOOP ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        console.error('i:', i);
        console.error('shuffled[i]:', shuffled[i]);
        console.error('shuffled[i + 1]:', shuffled[i + 1]);
        throw error;
      }
    }
    return matches;
  }

  startRound() {
    try {
      console.log('=== START ROUND DEBUG ===');
      console.log(`Starting round ${this.currentRound}, active players: ${this.activePlayers.length}`);
      console.log('startRound() called from:', new Error().stack);
      console.log('this.activePlayers:', this.activePlayers);
      console.log('this.players:', this.players);
      console.log('this.isArtifactSelectionActive:', this.isArtifactSelectionActive);
      
      if (this.isArtifactSelectionActive) {
        console.log('Artifact selection is active, preventing startRound()');
        return;
      }
      
      if (this.activePlayers.length <= 1) {
        console.log('=== ENDING TOURNAMENT - NOT ENOUGH PLAYERS ===');
        this.endTournament();
        return;
      }
      
      if ([5, 10, 15].includes(this.currentRound)) {
        console.log(`Triggering minion round for round ${this.currentRound}`);
        this.startMinionRound();
        return;
      }
      
      if ([3, 8, 13].includes(this.currentRound) && !this.artifactSelectionShown) {
        console.log(`Triggering artifact round for round ${this.currentRound}`);
        this.artifactSelectionShown = true;
        this.startArtifactRound();
        return;
      }
      
      console.log('=== ABOUT TO SET SPECIAL ROUND FLAG ===');
      this.isSpecialRound = [3, 8, 13].includes(this.currentRound);
      console.log('isSpecialRound set to:', this.isSpecialRound);
      
      console.log('=== ABOUT TO GENERATE MATCHES ===');
      this.currentMatches = this.generateMatches();
      console.log('Generated matches:', this.currentMatches);
      
      console.log('=== ABOUT TO SET MATCH INDEX ===');
      this.currentMatchIndex = 0;
      this.userBattleCompleted = false;
      this.isProcessingRoundResults = false; // Reset flag for new round
      console.log('Match index and flags set successfully');
      
      console.log('=== ABOUT TO UPDATE ROUND DISPLAY ===');
      this.updateRoundDisplay();
      console.log('Round display updated successfully');
      
      console.log('=== ABOUT TO START TIMER BUFFER ===');
      this.timer.startBuffer(() => {
        console.log('=== TIMER BUFFER CALLBACK TRIGGERED ===');
        this.startSimultaneousMatches();
      });
      console.log('Timer buffer started successfully');
      
      console.log('=== START ROUND COMPLETED SUCCESSFULLY ===');
    } catch (error) {
      console.error('=== START ROUND ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Current round:', this.currentRound);
      console.error('Active players:', this.activePlayers);
      console.error('All players:', this.players);
      console.error('Current matches:', this.currentMatches);
      console.error('Timer object:', this.timer);
      throw error;
    }
  }

  startSimultaneousMatches() {
    console.log('=== startSimultaneousMatches called ===');
    console.log('=== this.currentMatches ===', this.currentMatches);
    
    if (this.isArtifactSelectionActive) {
      console.log('Artifact selection is active, preventing startSimultaneousMatches()');
      return;
    }
    
    const userMatch = this.currentMatches.find(match => {
      console.log('=== Checking match in find ===', match);
      console.log('=== match.player1 ===', match.player1);
      console.log('=== match.player2 ===', match.player2);
      try {
        return (match.player1 && match.player1.name === "You") || (match.player2 && match.player2.name === "You");
      } catch (error) {
        console.error('=== ERROR IN USER MATCH FIND ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        console.error('Match object:', match);
        console.error('match.player1:', match.player1);
        console.error('match.player2:', match.player2);
        throw error;
      }
    });
    
    const backgroundMatches = this.currentMatches.filter(match => 
      (match.player1 && match.player1.name !== "You") && (match.player2 && match.player2.name !== "You")
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
    console.log(`Starting ${matches.length} background matches for round ${this.currentRound}`);
    
    matches.forEach((match, index) => {
      const delay = Math.random() * 2000 + 1000;
      console.log(`Background match ${index + 1}: ${match.player1.name} vs ${match.player2.name} - delay: ${delay.toFixed(0)}ms`);
      
      const matchId = debugTools.monitorBackgroundMatch(index, match.player1.name, match.player2.name, delay);
      
      setTimeout(() => {
        console.log(`Completing background match: ${match.player1.name} vs ${match.player2.name}`);
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
    
    const userPlayer = this.players && Array.isArray(this.players) ? this.players.find(p => p && p.name === "You") : null;
    if (userPlayer) {
      this.combat.setOnAbilityPurchased(() => {
        if (userPlayer) {
          userPlayer.hero = this.combat.combatShop.applyItemsToHero(userPlayer.hero);
          this.updatePlayerHero();
        }
      });
    }

    this.combat.setOnMoneyChange((newMoney) => {
      if (player1 && player1.name === "You") {
        player1.gold = newMoney;
        this.updatePlayersList();
      }
    });

    this.combat.selectRandomEnemy = () => ({ ...player2.hero });
    this.combat.init(player1.hero, player1.gold || 0);
    
    if (this.heroStatsCard && player1 && player1.name === "You") {
      this.heroStatsCard.updateHero(player1.hero);
    }
  }

  endBattle(result, player1, player2) {
    if (this.combat) {
      this.combat.clearTimers();
    }
    
    if ([5, 10, 15].includes(this.currentRound)) {
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
        const processedHero = StatsCalculator.processHeroStats(player2.hero);
        this.economy.awardMoney(player2, true, 0, processedHero.effectiveStats.goldBonus || 0);
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
    console.log(`Round ${this.currentRound} completion check: ${completedMatches}/${totalMatches} matches completed`);
    
    if (this.isProcessingRoundResults) {
      console.log(`Already processing round results for round ${this.currentRound}, skipping`);
      return;
    }
    
    if ([3, 8, 13].includes(this.currentRound) && this.artifactSelectionShown) {
      console.log(`Artifact selection is active for round ${this.currentRound}, skipping round completion`);
      return;
    }
    
    const allMatchesCompleted = this.currentMatches.every(match => match.completed);
    if (allMatchesCompleted) {
      console.log(`All matches completed for round ${this.currentRound}, processing results`);
      this.isProcessingRoundResults = true;
      setTimeout(() => {
        this.processRoundResults();
      }, 1000);
    } else {
      console.log(`Still waiting for ${totalMatches - completedMatches} matches to complete`);
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
    try {
      console.log('=== RENDER PLAYERS LIST DEBUG ===');
      console.log('this.players:', this.players);
      console.log('this.ghostPlayers:', this.ghostPlayers);
      
      const allPlayers = [...(this.players || []), ...(this.ghostPlayers || [])];
      console.log('allPlayers array:', allPlayers);
      
      return allPlayers.map((player, index) => {
        try {
          console.log(`=== PROCESSING PLAYER ${index} ===`, player);
          
          if (!player) {
            console.error(`Player at index ${index} is null/undefined`);
            return ''; // Skip null/undefined players
          }
          
          if (!player.playerHealth) {
            console.error(`Player at index ${index} missing playerHealth:`, player);
            return ''; // Skip players without health data
          }
          
          if (!player.hero) {
            console.error(`Player at index ${index} missing hero:`, player);
            return ''; // Skip players without hero data
          }
          
          const currentHealth = player.playerHealth.currentHealth || 50;
          const maxHealth = player.playerHealth.maxHealth || 50;
          const healthPercentage = (currentHealth / maxHealth) * 100;
          
          const playerName = player.name || 'Unknown Player';
          const heroName = player.hero.name || 'Unknown Hero';
          const heroAvatar = player.hero.avatar || '⚔️';
          const wins = player.wins || 0;
          const losses = player.losses || 0;
          const gold = player.gold || 0;
          
          return `
            <div class="player-card ${player.isEliminated ? 'eliminated' : ''} ${player.isGhost ? 'ghost' : ''} ${this.activePlayers.includes(player) ? 'active' : ''}">
              <div class="player-info">
                <div class="player-name">${playerName}</div>
                <div class="player-hero">${heroAvatar} ${heroName}</div>
              </div>
              <div class="player-health">
                <div class="health-bar">
                  <div class="health-fill" style="width: ${healthPercentage}%"></div>
                  <span class="health-text">${currentHealth}/${maxHealth}</span>
                </div>
              </div>
              <div class="player-stats">
                <span class="wins">Wins: ${wins}</span>
                <span class="losses">Losses: ${losses}</span>
                <span class="gold">💰 ${gold}</span>
              </div>
            </div>
          `;
        } catch (playerError) {
          console.error(`=== ERROR PROCESSING PLAYER ${index} ===`, playerError);
          console.error('Player data:', player);
          return ''; // Skip problematic players
        }
      }).filter(html => html !== '').join(''); // Filter out empty strings
    } catch (error) {
      console.error('=== RENDER PLAYERS LIST ERROR ===', error);
      console.error('Error stack:', error.stack);
      return '<div class="error">Error loading players list</div>';
    }
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
      try {
        console.log('=== TIMER UPDATE DEBUG ===');
        console.log('Timer data:', timerData);
        console.log('Players array exists:', !!this.players);
        console.log('Players array length:', this.players ? this.players.length : 'undefined');
        console.log('Players array content:', this.players);
        
        this.updateTimerDisplay(timerData);
        if (this.combat && timerData.damageMultiplier) {
          this.combat.setDamageMultiplier(timerData.damageMultiplier);
        }
        
        console.log('=== TIMER UPDATE COMPLETED SUCCESSFULLY ===');
      } catch (error) {
        console.error('=== TIMER UPDATE ERROR ===', error);
        console.error('Error stack:', error.stack);
        console.error('Timer data at error:', timerData);
        console.error('Players at error:', this.players);
        throw error;
      }
    });

    this.timer.setOnRoundEnd(() => {
      try {
        console.log('=== ROUND END DEBUG ===');
        if (this.combat) {
          this.combat.endBattle('timeout');
        } else {
          this.processRoundResults();
        }
      } catch (error) {
        console.error('=== ROUND END ERROR ===', error);
        throw error;
      }
    });

    this.timer.setOnDamageEscalation((isActive) => {
      try {
        console.log('=== DAMAGE ESCALATION DEBUG ===');
        console.log('Damage escalation active:', isActive);
        console.log('Players array exists:', !!this.players);
        console.log('Players array:', this.players);
        console.log('=== DAMAGE ESCALATION COMPLETED ===');
      } catch (error) {
        console.error('=== DAMAGE ESCALATION ERROR ===', error);
        throw error;
      }
    });
  }

  updateTimerDisplay(timerData) {
    try {
      console.log('=== UPDATE TIMER DISPLAY DEBUG ===');
      console.log('Timer data:', timerData);
      
      const timerElement = this.container.querySelector('#round-timer');
      if (timerElement) {
        const minutes = Math.floor(timerData.time / 60);
        const seconds = timerData.time % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timerData.isBuffer) {
          console.log('=== BUFFER PHASE ===');
          timerElement.innerHTML = `<div class="timer-display buffer">Pre-Round: ${timeString}</div>`;
          this.showRoundsShop();
          this.updateRoundsShopMoney();
        } else {
          console.log('=== ROUND PHASE ===');
          console.log('Damage escalation:', timerData.damageEscalation);
          console.log('Damage multiplier:', timerData.damageMultiplier);
          
          if (timerData.damageEscalation) {
            console.log('=== DAMAGE ESCALATION DETECTED IN TIMER UPDATE ===');
            console.log('About to process damage escalation UI changes...');
            console.log('Current players state:', this.players);
            console.log('Current combat state:', this.combat);
            console.log('Current roundsShop state:', this.roundsShop);
          }
          
          const damageEscalationClass = timerData.damageEscalation ? ' damage-escalation' : '';
          const multiplierText = timerData.damageMultiplier > 1 ? ` (${(timerData.damageMultiplier * 100).toFixed(0)}% damage)` : '';
          
          if (this.userBattleCompleted) {
            timerElement.innerHTML = `<div class="timer-display completed">Your Battle Complete - Others Fighting: ${timeString}${multiplierText}</div>`;
          } else {
            timerElement.innerHTML = `<div class="timer-display round${damageEscalationClass}">Round Timer: ${timeString}${multiplierText}</div>`;
          }
          
          console.log('=== ABOUT TO CALL hideRoundsShop() ===');
          this.hideRoundsShop();
          console.log('=== hideRoundsShop() COMPLETED ===');
        }
      }
      console.log('=== UPDATE TIMER DISPLAY COMPLETED ===');
    } catch (error) {
      console.error('=== UPDATE TIMER DISPLAY ERROR ===', error);
      console.error('Error stack:', error.stack);
      console.error('Timer data at error:', timerData);
      throw error;
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
    if (this.roundsShopContainer && this.players && Array.isArray(this.players)) {
      const userPlayer = this.players.find(p => p && p.name === "You");
      const playerGold = userPlayer ? userPlayer.gold : 300;
      
      this.roundsShop = new CombatShop(this.roundsShopContainer, null, this.currentRound);
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
    try {
      console.log('=== HIDE ROUNDS SHOP START ===');
      console.log('roundsShop exists:', !!this.roundsShop);
      
      const shopToggle = this.container.querySelector('#rounds-shop-toggle');
      console.log('shopToggle found:', !!shopToggle);
      if (shopToggle) {
        console.log('Setting shopToggle display to none...');
        shopToggle.style.display = 'none';
        console.log('shopToggle display set successfully');
      }
      
      if (this.roundsShop) {
        console.log('About to call this.roundsShop.hide()...');
        console.log('roundsShop object:', this.roundsShop);
        console.log('roundsShop.hide method exists:', typeof this.roundsShop.hide);
        
        if (typeof this.roundsShop.hide === 'function') {
          this.roundsShop.hide();
          console.log('this.roundsShop.hide() completed successfully');
        } else {
          console.log('roundsShop.hide() method not found, hiding shop container manually');
          const shopContainer = this.container.querySelector('#rounds-shop-container');
          if (shopContainer) {
            shopContainer.style.display = 'none';
            console.log('Shop container hidden manually');
          }
        }
      }
      
      console.log('=== HIDE ROUNDS SHOP COMPLETED ===');
    } catch (error) {
      console.error('=== HIDE ROUNDS SHOP ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('roundsShop object at error:', this.roundsShop);
      throw error;
    }
  }

  updateRoundsShopMoney() {
    try {
      console.log('=== UPDATE ROUNDS SHOP MONEY DEBUG ===');
      console.log('roundsShop exists:', !!this.roundsShop);
      console.log('players exists:', !!this.players);
      console.log('players is array:', Array.isArray(this.players));
      console.log('players array:', this.players);
      
      if (this.roundsShop && this.players && Array.isArray(this.players)) {
        const userPlayer = this.players.find(p => {
          console.log('=== CHECKING PLAYER IN updateRoundsShopMoney ===', p);
          return p && p.name && p.name === "You";
        });
        console.log('=== USER PLAYER FOUND ===', userPlayer);
        if (userPlayer) {
          this.roundsShop.setPlayerGold(userPlayer.gold);
          this.roundsShop.updateGoldDisplay();
        }
      }
      console.log('=== UPDATE ROUNDS SHOP MONEY COMPLETED ===');
    } catch (error) {
      console.error('=== UPDATE ROUNDS SHOP MONEY ERROR ===', error);
      console.error('Error stack:', error.stack);
      console.error('Players at error:', this.players);
      throw error;
    }
  }

  startInterRoundTimer() {
    if (this.isArtifactSelectionActive) {
      console.log('Artifact selection is active, preventing startInterRoundTimer()');
      return;
    }
    
    this.showRoundsShop();
    this.updateRoundsShopMoney();
    
    if (this.roundsShop && this.roundsShop.resetForNewRound) {
      this.roundsShop.resetForNewRound();
    }
    
    this.timer.startBuffer(() => {
      this.hideRoundsShop();
      this.startRound();
    });
  }

  startMinionRound() {
    console.log(`Starting minion round ${this.currentRound}`);
    this.isSpecialRound = true;
    this.updateRoundDisplay();
    
    const combatContainer = this.container.querySelector('#battle-area');
    if (combatContainer && this.players && Array.isArray(this.players)) {
      console.log('Combat container found, creating MinionCombat');
      const minionCombat = new MinionCombat(combatContainer, this.heroStatsCard);
      
      minionCombat.setOnBattleEnd((result) => {
        this.handleMinionBattleResult(result);
      });
      
      const userPlayer = this.players.find(p => p && p.name === "You");
      if (userPlayer) {
        console.log('User player found, initializing minion combat');
        const processedHero = StatsCalculator.processHeroStats(userPlayer.hero);
        
        processedHero.stats = {
          health: processedHero.effectiveStats.health,
          attack: processedHero.effectiveStats.attack,
          armor: processedHero.effectiveStats.armor,
          speed: processedHero.effectiveStats.speed,
          critChance: processedHero.effectiveStats.critChance || 0,
          evasionChance: processedHero.effectiveStats.evasionChance || 0,
          manaRegeneration: processedHero.effectiveStats.manaRegeneration || 0
        };
        
        if (!processedHero.effectiveStats) {
          processedHero.effectiveStats = processedHero.stats;
        }
        
        console.log('Processed hero with both stats formats:', {
          stats: processedHero.stats,
          effectiveStats: processedHero.effectiveStats
        });
        minionCombat.init(processedHero, userPlayer.gold, this.currentRound);
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
      
      equipmentReward.init(result.playerWon);
    }
  }

  handleArtifactSelection(artifact) {
    const userPlayer = this.players && Array.isArray(this.players) ? this.players.find(p => p && p.name === "You") : null;
    if (userPlayer) {
      userPlayer.hero = this.artifactSystem.applyArtifactToHero(userPlayer.hero, artifact);
      this.updatePlayerHero();
    }
    
    const combatContainer = this.container.querySelector('#battle-area');
    if (combatContainer) {
      combatContainer.innerHTML = '';
    }
    
    this.currentRound++;
    this.artifactSelectionShown = false;
    this.isArtifactSelectionActive = false;
    
    setTimeout(() => {
      this.startInterRoundTimer();
    }, 3000);
  }

  handleEquipmentSelection(equipment) {
    const userPlayer = this.players && Array.isArray(this.players) ? this.players.find(p => p && p.name === "You") : null;
    if (userPlayer) {
      if (!userPlayer.hero.equipment) {
        userPlayer.hero.equipment = [];
      }
      userPlayer.hero.equipment.push(equipment);
      
      if (equipment.stat === 'health') {
        userPlayer.hero.stats.health += equipment.value;
      } else if (equipment.stat === 'attack') {
        userPlayer.hero.stats.attack += equipment.value;
      } else if (equipment.stat === 'speed') {
        userPlayer.hero.stats.speed += equipment.value;
      } else if (equipment.stat === 'armor') {
        userPlayer.hero.stats.armor += equipment.value;
      } else if (equipment.stat === 'magicDamageReduction') {
        userPlayer.hero.stats.magicDamageReduction = (userPlayer.hero.stats.magicDamageReduction || 0) + equipment.value;
      } else if (equipment.stat === 'physicalDamageAmplification') {
        userPlayer.hero.stats.physicalDamageAmplification = (userPlayer.hero.stats.physicalDamageAmplification || 0) + equipment.value;
      } else if (equipment.stat === 'magicDamageAmplification') {
        userPlayer.hero.stats.magicDamageAmplification = (userPlayer.hero.stats.magicDamageAmplification || 0) + equipment.value;
      } else if (equipment.stat === 'critChance') {
        userPlayer.hero.stats.critChance = (userPlayer.hero.stats.critChance || 0) + equipment.value;
      } else if (equipment.stat === 'evasionChance') {
        userPlayer.hero.stats.evasionChance = (userPlayer.hero.stats.evasionChance || 0) + equipment.value;
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
    const userPlayer = this.players && Array.isArray(this.players) ? this.players.find(p => p && p.name === "You") : null;
    if (userPlayer && this.heroStatsCard) {
      this.heroStatsCard.updateHero(userPlayer.hero);
    }
  }

  handleBattleCompleted(data) {
    console.log('Battle completed:', data);
    const { matchId, result, winner } = data;
    
    const match = this.currentMatches.find(m => m.id === matchId);
    if (match) {
      match.completed = true;
      match.winner = winner;
      match.result = result;
      
      if (match.player1_username === 'You' || match.player2_username === 'You') {
        this.userBattleCompleted = true;
        this.displayBattleResult(match);
      }
      
      this.checkRoundCompletion();
    }
  }

  handleTournamentUpdate(data) {
    console.log('Tournament update:', data);
    this.players = data.players || this.players;
    this.currentMatches = data.currentMatches || this.currentMatches;
    this.currentRound = data.currentRound || this.currentRound;
    
    this.updatePlayersList();
    this.updateRoundDisplay();
  }

  handleTimerUpdate(data) {
    console.log('Timer update:', data);
    const { timeRemaining, type } = data;
    
    if (type === 'round_timer') {
      this.updateTimerDisplay({ time: timeRemaining });
    }
  }

  updateTournamentState(state) {
    try {
      console.log('=== WEBSOCKET UPDATE TOURNAMENT STATE DEBUG ===');
      console.log('Tournament state update:', state);
      console.log('Current players before update:', this.players);
      
      this.tournament = state.tournament;
      
      if (state.players && state.players.length > 0) {
        this.players = state.players.map(serverPlayer => {
          try {
            console.log('=== MAPPING SERVER PLAYER IN WEBSOCKET UPDATE ===', serverPlayer);
            
            const isCurrentUser = serverPlayer.username === 'testuser';
            const mappedPlayer = {
              id: serverPlayer.id || serverPlayer.player_id,
              name: isCurrentUser ? 'You' : (serverPlayer.username || 'Player'),
              hero: {
                name: serverPlayer.hero_name || 'Unknown Hero',
                class: serverPlayer.hero_class || 'Unknown',
                avatar: this.getHeroAvatar(serverPlayer.hero_class || 'Unknown'),
                stats: {
                  health: parseFloat(serverPlayer.base_health) || 100,
                  attack: parseFloat(serverPlayer.base_attack) || 25,
                  armor: parseFloat(serverPlayer.base_armor) || 0,
                  speed: parseFloat(serverPlayer.base_speed) || 1.0,
                  critChance: 0.05,
                  critDamage: 1.5,
                  evasionChance: 0.05,
                  evasionDamageReduction: 0.5,
                  magicDamageReduction: 0,
                  physicalDamageAmplification: 0,
                  magicDamageAmplification: 0,
                  manaRegeneration: 0,
                  attackSpeed: 0
                },
                abilities: {
                  passive: {
                    name: serverPlayer.passive_ability_name || 'Unknown',
                    description: 'Passive ability'
                  },
                  ultimate: {
                    name: serverPlayer.ultimate_ability_name || 'Unknown',
                    description: 'Ultimate ability'
                  }
                }
              },
              playerHealth: {
                currentHealth: serverPlayer.current_health || 50,
                maxHealth: serverPlayer.max_health || 50
              },
              isEliminated: serverPlayer.is_eliminated || false,
              wins: serverPlayer.consecutive_wins || 0,
              losses: serverPlayer.consecutive_losses || 0,
              gold: serverPlayer.gold || 300,
              consecutiveWins: serverPlayer.consecutive_wins || 0,
              consecutiveLosses: serverPlayer.consecutive_losses || 0,
              isCurrentUser: isCurrentUser
            };
            
            console.log('=== MAPPED PLAYER IN WEBSOCKET UPDATE ===', mappedPlayer);
            return mappedPlayer;
          } catch (playerError) {
            console.error('=== ERROR MAPPING PLAYER IN WEBSOCKET UPDATE ===', playerError);
            console.error('Server player data:', serverPlayer);
            throw playerError;
          }
        });
      }
      
      this.currentMatches = state.currentMatches || [];
      this.activePlayers = state.activePlayers || (this.players ? this.players.filter(p => p && !p.isEliminated) : []);
      
      console.log('=== FINAL PLAYERS AFTER WEBSOCKET UPDATE ===', this.players);
      
      this.updatePlayersList();
      this.updateRoundDisplay();
      
      console.log('=== WEBSOCKET UPDATE TOURNAMENT STATE COMPLETED ===');
    } catch (error) {
      console.error('=== WEBSOCKET UPDATE TOURNAMENT STATE ERROR ===', error);
      console.error('Error stack:', error.stack);
      console.error('State data at error:', state);
      console.error('Players at error:', this.players);
      throw error;
    }
  }

  displayBattleResult(match) {
    const isUserWinner = match.winner === 'You';
    const resultMessage = isUserWinner ? 'Victory!' : 'Defeat!';
    
    const notification = document.createElement('div');
    notification.className = `battle-result-notification ${isUserWinner ? 'victory' : 'defeat'}`;
    notification.innerHTML = `
      <h3>${resultMessage}</h3>
      <p>vs ${isUserWinner ? match.player2_username : match.player1_username}</p>
    `;
    
    this.container.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  async startServerBattle(matchId) {
    try {
      const result = await apiClient.simulateMatch(matchId);
      console.log('Server battle result:', result);
      return result;
    } catch (error) {
      console.error('Failed to start server battle:', error);
      throw error;
    }
  }

  async loadShopItems() {
    try {
      if (this.currentTournament) {
        const shopData = await apiClient.getShop(this.currentTournament.id);
        return shopData.shopItems || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to load shop items:', error);
      return [];
    }
  }

  async purchaseAbility(abilityId) {
    try {
      if (this.currentTournament) {
        const result = await apiClient.purchaseAbility(this.currentTournament.id, abilityId);
        
        if (apiClient.socket) {
          apiClient.broadcastPurchase(this.currentTournament.id, abilityId);
        }
        
        this.updateRoundsShopMoney(result.newGold);
        
        if (this.heroStatsCard && this.userHero) {
          this.heroStatsCard.updateHero(this.userHero);
        }
        
        return result;
      }
    } catch (error) {
      console.error('Failed to purchase ability:', error);
      throw error;
    }
  }
}

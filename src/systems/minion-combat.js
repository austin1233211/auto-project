import { Combat } from './combat.js';
import { StatsCalculator } from '../core/stats-calculator.js';

export class MinionCombat extends Combat {
  constructor(container, heroStatsCard = null) {
    super(container, heroStatsCard);
    this.isMinionBattle = true;
    this.currentRound = 5;
  }

  init(playerHero, playerGold, currentRound = 5) {
    this.currentRound = currentRound;
    this.playerMoney = playerGold;
    this.battleLog = [];
    this.isGameOver = false;
    this.clearTimers();
    
    this.playerHero = StatsCalculator.processHeroStats({
      ...playerHero,
      currentHealth: playerHero.stats.health,
      currentMana: 0,
      maxMana: 100
    });
    
    this.enemyHero = this.selectRandomEnemy();
    this.enemyHero = StatsCalculator.processHeroStats(this.enemyHero);
    this.enemyHero.currentHealth = this.enemyHero.stats.health;
    this.enemyHero.currentMana = 0;
    this.enemyHero.maxMana = 100;
    
    this.render();
    this.startBattle();
  }

  selectRandomEnemy() {
    const minionsByRound = {
      5: [
        { name: 'Goblin Warrior', emoji: '👹', stats: { health: 120, attack: 25, speed: 15, armor: 5 } },
        { name: 'Orc Brute', emoji: '🧌', stats: { health: 150, attack: 30, speed: 10, armor: 8 } },
        { name: 'Skeleton Fighter', emoji: '💀', stats: { health: 100, attack: 28, speed: 18, armor: 3 } }
      ],
      10: [
        { name: 'Troll Champion', emoji: '🧌', stats: { health: 250, attack: 45, speed: 12, armor: 15 } },
        { name: 'Dark Knight', emoji: '⚔️', stats: { health: 200, attack: 50, speed: 20, armor: 20 } },
        { name: 'Shadow Beast', emoji: '👹', stats: { health: 180, attack: 55, speed: 25, armor: 10 } }
      ],
      15: [
        { name: 'Dragon Whelp', emoji: '🐉', stats: { health: 400, attack: 70, speed: 30, armor: 25 } },
        { name: 'Demon Lord', emoji: '😈', stats: { health: 350, attack: 80, speed: 35, armor: 30 } },
        { name: 'Ancient Golem', emoji: '🗿', stats: { health: 500, attack: 60, speed: 15, armor: 40 } }
      ]
    };

    const currentRound = this.getCurrentRound();
    const availableMinions = minionsByRound[currentRound] || minionsByRound[5];
    const selectedMinion = availableMinions[Math.floor(Math.random() * availableMinions.length)];

    const minion = {
      ...selectedMinion,
      effectiveStats: {
        health: selectedMinion.stats.health,
        attack: selectedMinion.stats.attack,
        armor: selectedMinion.stats.armor,
        speed: selectedMinion.stats.speed,
        critChance: 0,
        evasionChance: 0,
        manaRegeneration: 0
      },
      abilities: {
        passive: { name: 'Minion Resilience', description: 'Increased health and armor' },
        ultimate: { name: 'Minion Rage', description: 'Powerful attack when low on health' }
      }
    };

    return minion;
  }

  getCurrentRound() {
    return this.currentRound || 5;
  }

  endBattle(winner) {
    this.isGameOver = true;
    this.clearTimers();
    
    const battleResult = {
      winner: winner,
      playerWon: winner === this.playerHero,
      isMinionBattle: true
    };

    if (this.onBattleEnd) {
      this.onBattleEnd(battleResult);
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="combat-container">
        <div class="combat-header">
          <h2>⚔️ Minion Battle</h2>
          <div class="battle-info">Face the minion guardian to earn equipment!</div>
        </div>
        
        <div class="heroes-container">
          <div class="hero-section player-section">
            <div class="hero-card">
              <div class="hero-avatar">${this.playerHero.emoji}</div>
              <div class="hero-info">
                <div class="hero-name">${this.playerHero.name}</div>
                <div class="health-bar">
                  <div class="health-fill player-health" style="width: 100%"></div>
                  <span class="health-text">HP: <span class="current-health">${this.playerHero.currentHealth}</span>/<span class="max-health">${this.playerHero.stats.health}</span></span>
                </div>
                <div class="mana-bar">
                  <div class="mana-fill player-mana" style="width: 0%"></div>
                  <span class="mana-text">Mana: <span class="current-mana">0</span>/<span class="max-mana">${this.playerHero.maxMana}</span></span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="vs-section">
            <div class="vs-text">VS</div>
          </div>
          
          <div class="hero-section enemy-section">
            <div class="hero-card">
              <div class="hero-avatar">${this.enemyHero.emoji}</div>
              <div class="hero-info">
                <div class="hero-name">${this.enemyHero.name}</div>
                <div class="health-bar">
                  <div class="health-fill enemy-health" style="width: 100%"></div>
                  <span class="health-text">HP: <span class="current-health">${this.enemyHero.currentHealth}</span>/<span class="max-health">${this.enemyHero.stats.health}</span></span>
                </div>
                <div class="mana-bar">
                  <div class="mana-fill enemy-mana" style="width: 0%"></div>
                  <span class="mana-text">Mana: <span class="current-mana">0</span>/<span class="max-mana">${this.enemyHero.maxMana}</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="battle-log-container">
          <div class="battle-log-header">Battle Log</div>
          <div class="battle-log" id="battle-log"></div>
        </div>
        
        <div class="combat-shop-container" id="combat-shop-container" style="display: none;"></div>
      </div>
    `;
  }
}

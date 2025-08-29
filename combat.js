import { heroes } from './heroes.js';
import { StatsCalculator } from './stats-calculator.js';
import { AbilitySystem } from './abilities.js';

export class Combat {
  constructor(container) {
    this.container = container;
    this.playerHero = null;
    this.enemyHero = null;
    this.currentTurn = 'player';
    this.battleLog = [];
    this.isGameOver = false;
    this.onBattleEnd = null;
    this.abilitySystem = new AbilitySystem(this);
  }

  init(playerHero) {
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
    this.battleLog = [];
    this.isGameOver = false;
    this.currentTurn = 'player';
    
    this.render();
    this.startBattle();
  }

  selectRandomEnemy() {
    const availableEnemies = heroes.filter(hero => hero.id !== this.playerHero.id);
    const randomIndex = Math.floor(Math.random() * availableEnemies.length);
    return { ...availableEnemies[randomIndex] };
  }

  render() {
    this.container.innerHTML = `
      <div class="combat-container">
        <h1 class="combat-title">Battle Arena</h1>
        
        <div class="battle-field">
          <div class="hero-battle-card player">
            <div class="hero-avatar">${this.playerHero.avatar}</div>
            <div class="hero-name">${this.playerHero.name}</div>
            <div class="health-bar">
              <div class="health-fill player-health" style="width: 100%"></div>
              <span class="health-text">${this.playerHero.currentHealth}/${this.playerHero.stats.health}</span>
            </div>
            <div class="mana-bar">
              <div class="mana-fill player-mana" style="width: 0%"></div>
              <span class="mana-text">${this.playerHero.currentMana}/${this.playerHero.maxMana}</span>
            </div>
            <div class="hero-stats-mini">
              ATK: ${Math.round(this.playerHero.effectiveStats.attack)} | ARM: ${Math.round(this.playerHero.effectiveStats.armor)} | SPD: ${Math.round(this.playerHero.effectiveStats.speed)}
            </div>
          </div>

          <div class="vs-indicator">VS</div>

          <div class="hero-battle-card enemy">
            <div class="hero-avatar">${this.enemyHero.avatar}</div>
            <div class="hero-name">${this.enemyHero.name}</div>
            <div class="health-bar">
              <div class="health-fill enemy-health" style="width: 100%"></div>
              <span class="health-text">${this.enemyHero.currentHealth}/${this.enemyHero.stats.health}</span>
            </div>
            <div class="mana-bar">
              <div class="mana-fill enemy-mana" style="width: 0%"></div>
              <span class="mana-text">${this.enemyHero.currentMana}/${this.enemyHero.maxMana}</span>
            </div>
            <div class="hero-stats-mini">
              ATK: ${Math.round(this.enemyHero.effectiveStats.attack)} | ARM: ${Math.round(this.enemyHero.effectiveStats.armor)} | SPD: ${Math.round(this.enemyHero.effectiveStats.speed)}
            </div>
          </div>
        </div>

        <div class="battle-log">
          <h3>Battle Log</h3>
          <div class="log-entries" id="log-entries">
            <p>Battle begins! ${this.playerHero.name} vs ${this.enemyHero.name}</p>
          </div>
        </div>

        <div class="battle-controls">
          <div class="auto-battle-status" id="battle-status">Auto-battle in progress...</div>
          <button class="action-button secondary" id="back-to-selection">Back to Hero Selection</button>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const backBtn = this.container.querySelector('#back-to-selection');

    backBtn.addEventListener('click', () => {
      if (this.onBattleEnd) {
        this.onBattleEnd('back');
      }
    });
  }

  calculateAttackInterval(speed) {
    const baseInterval = 3000;
    const speedMultiplier = speed / 10;
    return Math.max(1000, baseInterval / speedMultiplier);
  }

  startBattle() {
    this.addToLog(`${this.playerHero.name} (${Math.round(this.playerHero.effectiveStats.speed)} SPD) vs ${this.enemyHero.name} (${Math.round(this.enemyHero.effectiveStats.speed)} SPD)`);
    
    if (this.enemyHero.effectiveStats.speed > this.playerHero.effectiveStats.speed) {
      this.addToLog(`${this.enemyHero.name} is faster and goes first!`);
      this.currentTurn = 'enemy';
      const initialDelay = this.calculateAttackInterval(this.enemyHero.effectiveStats.speed);
      setTimeout(() => this.autoTurn(), initialDelay);
    } else {
      this.addToLog(`${this.playerHero.name} goes first!`);
      this.currentTurn = 'player';
      const initialDelay = this.calculateAttackInterval(this.playerHero.effectiveStats.speed);
      setTimeout(() => this.autoTurn(), initialDelay);
    }
  }

  autoTurn() {
    if (this.isGameOver) return;

    const currentHero = this.currentTurn === 'player' ? this.playerHero : this.enemyHero;
    const targetHero = this.currentTurn === 'player' ? this.enemyHero : this.playerHero;
    
    let damage;
    let manaGain = 25;

    if (currentHero.currentMana >= currentHero.maxMana) {
      const ability = currentHero.abilities[0];
      const abilityResult = this.abilitySystem.executeAbility(currentHero, targetHero, ability.name);
      damage = abilityResult.damage;
      currentHero.currentMana = 0;
    } else {
      damage = this.calculateDamage(currentHero.effectiveStats.attack, targetHero.effectiveStats.armor);
      this.addToLog(`${currentHero.name} attacks for ${damage} damage!`);
      currentHero.currentMana = Math.min(currentHero.maxMana, currentHero.currentMana + manaGain);
    }

    if (currentHero.currentMana < currentHero.maxMana) {
      targetHero.currentHealth = Math.max(0, targetHero.currentHealth - damage);
    }
    
    this.updateHealthAndManaBars();

    if (targetHero.currentHealth <= 0) {
      const result = this.currentTurn === 'player' ? 'victory' : 'defeat';
      this.endBattle(result);
      return;
    }

    this.currentTurn = this.currentTurn === 'player' ? 'enemy' : 'player';
    const nextHero = this.currentTurn === 'player' ? this.playerHero : this.enemyHero;
    const attackInterval = this.calculateAttackInterval(nextHero.effectiveStats.speed);
    setTimeout(() => this.autoTurn(), attackInterval);
  }

  calculateDamage(attack, armor) {
    const baseDamage = attack;
    const damageReduction = armor * 0.1;
    const finalDamage = Math.max(1, Math.round(baseDamage - damageReduction));
    return finalDamage;
  }

  updateHealthAndManaBars() {
    const playerHealthPercent = (this.playerHero.currentHealth / this.playerHero.stats.health) * 100;
    const enemyHealthPercent = (this.enemyHero.currentHealth / this.enemyHero.stats.health) * 100;
    const playerManaPercent = (this.playerHero.currentMana / this.playerHero.maxMana) * 100;
    const enemyManaPercent = (this.enemyHero.currentMana / this.enemyHero.maxMana) * 100;

    const playerHealthBar = this.container.querySelector('.player-health');
    const enemyHealthBar = this.container.querySelector('.enemy-health');
    const playerManaBar = this.container.querySelector('.player-mana');
    const enemyManaBar = this.container.querySelector('.enemy-mana');
    const playerHealthText = this.container.querySelector('.player .health-text');
    const enemyHealthText = this.container.querySelector('.enemy .health-text');
    const playerManaText = this.container.querySelector('.player .mana-text');
    const enemyManaText = this.container.querySelector('.enemy .mana-text');

    playerHealthBar.style.width = `${playerHealthPercent}%`;
    enemyHealthBar.style.width = `${enemyHealthPercent}%`;
    playerManaBar.style.width = `${playerManaPercent}%`;
    enemyManaBar.style.width = `${enemyManaPercent}%`;
    
    playerHealthText.textContent = `${this.playerHero.currentHealth}/${this.playerHero.stats.health}`;
    enemyHealthText.textContent = `${this.enemyHero.currentHealth}/${this.enemyHero.stats.health}`;
    playerManaText.textContent = `${this.playerHero.currentMana}/${this.playerHero.maxMana}`;
    enemyManaText.textContent = `${this.enemyHero.currentMana}/${this.enemyHero.maxMana}`;
  }

  addToLog(message) {
    this.battleLog.push(message);
    const logEntries = this.container.querySelector('#log-entries');
    const logEntry = document.createElement('p');
    logEntry.textContent = message;
    logEntries.appendChild(logEntry);
    logEntries.scrollTop = logEntries.scrollHeight;
  }

  endBattle(result) {
    this.isGameOver = true;
    
    if (result === 'victory') {
      this.addToLog(`🎉 Victory! ${this.playerHero.name} wins the battle!`);
    } else {
      this.addToLog(`💀 Defeat! ${this.enemyHero.name} wins the battle!`);
    }

    const battleStatus = this.container.querySelector('#battle-status');
    battleStatus.textContent = result === 'victory' ? 'Victory!' : 'Defeated!';
    battleStatus.className = `auto-battle-status ${result}`;

    setTimeout(() => {
      if (this.onBattleEnd) {
        this.onBattleEnd(result);
      }
    }, 3000);
  }

  setOnBattleEnd(callback) {
    this.onBattleEnd = callback;
  }
}

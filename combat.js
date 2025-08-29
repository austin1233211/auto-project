import { heroes } from './heroes.js';

export class Combat {
  constructor(container) {
    this.container = container;
    this.playerHero = null;
    this.enemyHero = null;
    this.currentTurn = 'player';
    this.battleLog = [];
    this.isGameOver = false;
    this.onBattleEnd = null;
  }

  init(playerHero) {
    this.playerHero = { 
      ...playerHero, 
      currentHealth: playerHero.stats.health,
      currentMana: 0,
      maxMana: 100
    };
    this.enemyHero = this.selectRandomEnemy();
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
              ATK: ${this.playerHero.stats.attack} | ARM: ${this.playerHero.stats.armor} | SPD: ${this.playerHero.stats.speed}
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
              ATK: ${this.enemyHero.stats.attack} | ARM: ${this.enemyHero.stats.armor} | SPD: ${this.enemyHero.stats.speed}
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

  startBattle() {
    this.addToLog(`${this.playerHero.name} (${this.playerHero.stats.speed} SPD) vs ${this.enemyHero.name} (${this.enemyHero.stats.speed} SPD)`);
    
    if (this.enemyHero.stats.speed > this.playerHero.stats.speed) {
      this.addToLog(`${this.enemyHero.name} is faster and goes first!`);
      this.currentTurn = 'enemy';
      setTimeout(() => this.autoTurn(), 1500);
    } else {
      this.addToLog(`${this.playerHero.name} goes first!`);
      this.currentTurn = 'player';
      setTimeout(() => this.autoTurn(), 1500);
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
      damage = this.calculateDamage(currentHero.stats.attack * 1.5, targetHero.stats.armor);
      this.addToLog(`${currentHero.name} uses ${ability.name} for ${damage} damage!`);
      currentHero.currentMana = 0;
    } else {
      damage = this.calculateDamage(currentHero.stats.attack, targetHero.stats.armor);
      this.addToLog(`${currentHero.name} attacks for ${damage} damage!`);
      currentHero.currentMana = Math.min(currentHero.maxMana, currentHero.currentMana + manaGain);
    }

    targetHero.currentHealth = Math.max(0, targetHero.currentHealth - damage);
    this.updateHealthAndManaBars();

    if (targetHero.currentHealth <= 0) {
      const result = this.currentTurn === 'player' ? 'victory' : 'defeat';
      this.endBattle(result);
      return;
    }

    this.currentTurn = this.currentTurn === 'player' ? 'enemy' : 'player';
    setTimeout(() => this.autoTurn(), 2000);
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

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
    this.playerHero = { ...playerHero, currentHealth: playerHero.stats.health };
    this.enemyHero = this.selectRandomEnemy();
    this.enemyHero.currentHealth = this.enemyHero.stats.health;
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
          <button class="action-button" id="attack-btn">Attack</button>
          <button class="action-button" id="ability-btn">Use Ability</button>
          <button class="action-button secondary" id="back-to-selection">Back to Hero Selection</button>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const attackBtn = this.container.querySelector('#attack-btn');
    const abilityBtn = this.container.querySelector('#ability-btn');
    const backBtn = this.container.querySelector('#back-to-selection');

    attackBtn.addEventListener('click', () => {
      if (this.currentTurn === 'player' && !this.isGameOver) {
        this.playerAttack();
      }
    });

    abilityBtn.addEventListener('click', () => {
      if (this.currentTurn === 'player' && !this.isGameOver) {
        this.playerUseAbility();
      }
    });

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
      setTimeout(() => this.enemyTurn(), 1000);
    } else {
      this.addToLog(`${this.playerHero.name} goes first!`);
      this.currentTurn = 'player';
    }
  }

  playerAttack() {
    const damage = this.calculateDamage(this.playerHero.stats.attack, this.enemyHero.stats.armor);
    this.enemyHero.currentHealth = Math.max(0, this.enemyHero.currentHealth - damage);
    
    this.addToLog(`${this.playerHero.name} attacks for ${damage} damage!`);
    this.updateHealthBars();

    if (this.enemyHero.currentHealth <= 0) {
      this.endBattle('victory');
      return;
    }

    this.currentTurn = 'enemy';
    setTimeout(() => this.enemyTurn(), 1500);
  }

  playerUseAbility() {
    const ability = this.playerHero.abilities[0];
    const damage = this.calculateDamage(this.playerHero.stats.attack * 1.5, this.enemyHero.stats.armor);
    this.enemyHero.currentHealth = Math.max(0, this.enemyHero.currentHealth - damage);
    
    this.addToLog(`${this.playerHero.name} uses ${ability.name} for ${damage} damage!`);
    this.updateHealthBars();

    if (this.enemyHero.currentHealth <= 0) {
      this.endBattle('victory');
      return;
    }

    this.currentTurn = 'enemy';
    setTimeout(() => this.enemyTurn(), 1500);
  }

  enemyTurn() {
    if (this.isGameOver) return;

    const useAbility = Math.random() < 0.3;
    let damage;

    if (useAbility) {
      const ability = this.enemyHero.abilities[0];
      damage = this.calculateDamage(this.enemyHero.stats.attack * 1.5, this.playerHero.stats.armor);
      this.addToLog(`${this.enemyHero.name} uses ${ability.name} for ${damage} damage!`);
    } else {
      damage = this.calculateDamage(this.enemyHero.stats.attack, this.playerHero.stats.armor);
      this.addToLog(`${this.enemyHero.name} attacks for ${damage} damage!`);
    }

    this.playerHero.currentHealth = Math.max(0, this.playerHero.currentHealth - damage);
    this.updateHealthBars();

    if (this.playerHero.currentHealth <= 0) {
      this.endBattle('defeat');
      return;
    }

    this.currentTurn = 'player';
  }

  calculateDamage(attack, armor) {
    const baseDamage = attack;
    const damageReduction = armor * 0.1;
    const finalDamage = Math.max(1, Math.round(baseDamage - damageReduction));
    return finalDamage;
  }

  updateHealthBars() {
    const playerHealthPercent = (this.playerHero.currentHealth / this.playerHero.stats.health) * 100;
    const enemyHealthPercent = (this.enemyHero.currentHealth / this.enemyHero.stats.health) * 100;

    const playerHealthBar = this.container.querySelector('.player-health');
    const enemyHealthBar = this.container.querySelector('.enemy-health');
    const playerHealthText = this.container.querySelector('.player .health-text');
    const enemyHealthText = this.container.querySelector('.enemy .health-text');

    playerHealthBar.style.width = `${playerHealthPercent}%`;
    enemyHealthBar.style.width = `${enemyHealthPercent}%`;
    playerHealthText.textContent = `${this.playerHero.currentHealth}/${this.playerHero.stats.health}`;
    enemyHealthText.textContent = `${this.enemyHero.currentHealth}/${this.enemyHero.stats.health}`;
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

    const attackBtn = this.container.querySelector('#attack-btn');
    const abilityBtn = this.container.querySelector('#ability-btn');
    attackBtn.disabled = true;
    abilityBtn.disabled = true;
    attackBtn.textContent = result === 'victory' ? 'Victory!' : 'Defeated';
    abilityBtn.style.display = 'none';

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

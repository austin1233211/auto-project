import { heroes } from './heroes.js';
import { StatsCalculator } from './stats-calculator.js';
import { AbilitySystem } from './abilities.js';
import { CombatShop } from './combat-shop-v2.js';

export class Combat {
  constructor(container, heroStatsCard = null) {
    this.container = container;
    this.playerHero = null;
    this.enemyHero = null;
    this.battleLog = [];
    this.isGameOver = false;
    this.onBattleEnd = null;
    this.abilitySystem = new AbilitySystem(this);
    this.playerAttackTimer = null;
    this.enemyAttackTimer = null;
    this.playerManaTimer = null;
    this.enemyManaTimer = null;
    this.manaUITimer = null;
    this.statusEffectsTimer = null;
    this.speedMultiplier = 1;
    this.damageMultiplier = 1;
    this.combatShop = null;
    this.combatShopContainer = null;
    this.heroStatsCard = heroStatsCard;
  }

  init(playerHero, playerMoney = 0) {
    this.playerHero = StatsCalculator.processHeroStats({ 
      ...playerHero, 
      currentHealth: playerHero.stats.health,
      currentMana: 0,
      maxMana: 100
    });
    this.playerMoney = playerMoney;
    this.enemyHero = this.selectRandomEnemy();
    this.enemyHero = StatsCalculator.processHeroStats(this.enemyHero);
    this.enemyHero.currentHealth = this.enemyHero.stats.health;
    this.enemyHero.currentMana = 0;
    this.enemyHero.maxMana = 100;
    this.battleLog = [];
    this.isGameOver = false;
    this.clearTimers();
    
    this.render();
    this.initCombatShop();
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
        <div class="combat-header">
          <h1 class="combat-title">Battle Arena</h1>
          <div class="player-money-display">💰 Money: ${this.playerMoney || 0}</div>
        </div>
        
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
              ATK: ${Math.round(this.playerHero.effectiveStats.attack)} | ARM: ${this.playerHero.effectiveStats.armor}% | SPD: ${Math.round(this.playerHero.effectiveStats.speed)} | CRIT: ${(this.playerHero.effectiveStats.critChance * 100).toFixed(1)}% | EVA: ${(this.playerHero.effectiveStats.evasionChance * 100).toFixed(1)}%
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
              ATK: ${Math.round(this.enemyHero.effectiveStats.attack)} | ARM: ${this.enemyHero.effectiveStats.armor}% | SPD: ${Math.round(this.enemyHero.effectiveStats.speed)} | CRIT: ${(this.enemyHero.effectiveStats.critChance * 100).toFixed(1)}% | EVA: ${(this.enemyHero.effectiveStats.evasionChance * 100).toFixed(1)}%
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
          <button class="action-button secondary" id="back-to-selection" style="display: none;">Back to Hero Selection</button>
        </div>
        
        <button class="combat-shop-toggle" id="combat-shop-toggle">🏪</button>
        <div id="combat-shop-container" class="combat-shop-container"></div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const backBtn = this.container.querySelector('#back-to-selection');
    const shopToggleBtn = this.container.querySelector('#combat-shop-toggle');

    backBtn.addEventListener('click', () => {
      if (this.onBattleEnd) {
        this.onBattleEnd('back');
      }
    });

    shopToggleBtn.addEventListener('click', () => {
      if (this.combatShop) {
        this.combatShop.toggle();
      }
    });
  }

  calculateAttackInterval(attacksPerSecond) {
    const interval = 1000 / attacksPerSecond;
    return Math.max(250, interval / this.speedMultiplier);
  }

  startManaRegeneration() {
    const manaInterval = 250;
    const manaPerTick = Math.ceil(11 * (manaInterval / 1000));
    
    this.playerManaTimer = setInterval(() => {
      if (!this.isGameOver && this.playerHero.currentMana < this.playerHero.maxMana) {
        const totalRegen = 11 + (this.playerHero.effectiveStats.manaRegeneration || 0);
        const regenAmount = Math.ceil(totalRegen * (manaInterval / 1000));
        this.playerHero.currentMana = Math.min(this.playerHero.maxMana, this.playerHero.currentMana + regenAmount);
      }
    }, manaInterval);
    
    this.enemyManaTimer = setInterval(() => {
      if (!this.isGameOver && this.enemyHero.currentMana < this.enemyHero.maxMana) {
        const totalRegen = 11 + (this.enemyHero.effectiveStats.manaRegeneration || 0);
        const regenAmount = Math.ceil(totalRegen * (manaInterval / 1000));
        this.enemyHero.currentMana = Math.min(this.enemyHero.maxMana, this.enemyHero.currentMana + regenAmount);
      }
    }, manaInterval);
    
    this.manaUITimer = setInterval(() => {
      if (!this.isGameOver) {
        this.updateManaBars();
      }
    }, 250);
  }

  startStatusEffectsTimer() {
    this.statusEffectsTimer = setInterval(() => {
      if (!this.isGameOver) {
        this.abilitySystem.processStatusEffects(this.playerHero);
        this.abilitySystem.processStatusEffects(this.enemyHero);
        this.updateHealthBars();
      }
    }, 1000);
  }

  clearTimers() {
    if (this.playerAttackTimer) {
      clearInterval(this.playerAttackTimer);
      this.playerAttackTimer = null;
    }
    if (this.enemyAttackTimer) {
      clearInterval(this.enemyAttackTimer);
      this.enemyAttackTimer = null;
    }
    if (this.playerManaTimer) {
      clearInterval(this.playerManaTimer);
      this.playerManaTimer = null;
    }
    if (this.enemyManaTimer) {
      clearInterval(this.enemyManaTimer);
      this.enemyManaTimer = null;
    }
    if (this.manaUITimer) {
      clearInterval(this.manaUITimer);
      this.manaUITimer = null;
    }
    if (this.statusEffectsTimer) {
      clearInterval(this.statusEffectsTimer);
      this.statusEffectsTimer = null;
    }
  }

  startBattle() {
    this.addToLog(`${this.playerHero.name} (${Math.round(this.playerHero.effectiveStats.speed)} SPD) vs ${this.enemyHero.name} (${Math.round(this.enemyHero.effectiveStats.speed)} SPD)`);
    this.addToLog(`Battle begins! Both heroes attack simultaneously based on their speed.`);
    
    const playerAttackInterval = this.calculateAttackInterval(this.playerHero.effectiveStats.speed);
    const enemyAttackInterval = this.calculateAttackInterval(this.enemyHero.effectiveStats.speed);
    
    this.addToLog(`${this.playerHero.name} attacks ${this.playerHero.effectiveStats.speed.toFixed(2)} times/sec | ${this.enemyHero.name} attacks ${this.enemyHero.effectiveStats.speed.toFixed(2)} times/sec`);
    
    this.playerAttackTimer = setInterval(() => {
      if (!this.isGameOver) {
        this.executeAttack(this.playerHero, this.enemyHero);
      }
    }, playerAttackInterval);
    
    this.enemyAttackTimer = setInterval(() => {
      if (!this.isGameOver) {
        this.executeAttack(this.enemyHero, this.playerHero);
      }
    }, enemyAttackInterval);
    
    this.startManaRegeneration();
    this.startStatusEffectsTimer();
  }

  executeAttack(attacker, target) {
    if (this.isGameOver) return;

    let damage;

    const passiveResult = this.abilitySystem.processPassiveAbility(attacker, target);
    
    if (attacker.currentMana >= attacker.maxMana) {
      const ultimateAbility = attacker.abilities.ultimate;
      const abilityResult = this.abilitySystem.executeAbility(attacker, target, ultimateAbility.name);
      damage = abilityResult.damage;
      attacker.currentMana = 0;
    } else {
      let finalDamage = this.calculateDamage(attacker.effectiveStats.attack, target, 'physical');
      
      if (Math.random() < target.effectiveStats.evasionChance) {
        finalDamage = Math.round(finalDamage * (1 - target.effectiveStats.evasionDamageReduction));
        this.addToLog(`${target.name} partially evades, reducing damage to ${finalDamage}!`);
      }
      
      let totalCritChance = attacker.effectiveStats.critChance;
      if (passiveResult && passiveResult.criticalHit) {
        totalCritChance += 0.15;
      }
      
      if (Math.random() < totalCritChance) {
        finalDamage = Math.round(finalDamage * attacker.effectiveStats.critDamage);
        this.addToLog(`${attacker.name} attacks with a critical hit for ${finalDamage} damage!`);
      } else {
        this.addToLog(`${attacker.name} attacks for ${finalDamage} damage!`);
      }
      
      damage = finalDamage;
    }

    target.currentHealth = Math.max(0, target.currentHealth - damage);
    
    this.updateHealthBars();

    if (target.currentHealth <= 0) {
      const result = target === this.enemyHero ? 'victory' : 'defeat';
      this.endBattle(result);
      return;
    }
  }

  calculateDamage(attack, target, damageType = 'physical') {
    const baseDamage = attack;
    
    let damageReduction = 0;
    if (damageType === 'physical') {
      damageReduction = target.effectiveStats.armor;
    } else if (damageType === 'magic') {
      damageReduction = target.effectiveStats.magicDamageReduction || 0;
    }
    
    let finalDamage = baseDamage * (1 - damageReduction / 100);
    
    let damageAmplification = 0;
    if (damageType === 'physical') {
      damageAmplification = target.effectiveStats.physicalDamageAmplification || 0;
    } else if (damageType === 'magic') {
      damageAmplification = target.effectiveStats.magicDamageAmplification || 0;
    }
    
    finalDamage = finalDamage * (1 + damageAmplification / 100);
    
    finalDamage = finalDamage * this.damageMultiplier;
    
    return Math.max(1, Math.round(finalDamage));
  }

  updateHealthBars() {
    const playerHealthPercent = (this.playerHero.currentHealth / this.playerHero.stats.health) * 100;
    const enemyHealthPercent = (this.enemyHero.currentHealth / this.enemyHero.stats.health) * 100;

    const playerHealthBar = this.container.querySelector('.player-health');
    const enemyHealthBar = this.container.querySelector('.enemy-health');
    const playerHealthText = this.container.querySelector('.player .health-text');
    const enemyHealthText = this.container.querySelector('.enemy .health-text');

    if (playerHealthBar) playerHealthBar.style.width = `${playerHealthPercent}%`;
    if (enemyHealthBar) enemyHealthBar.style.width = `${enemyHealthPercent}%`;
    if (playerHealthText) playerHealthText.textContent = `${this.playerHero.currentHealth}/${this.playerHero.stats.health}`;
    if (enemyHealthText) enemyHealthText.textContent = `${this.enemyHero.currentHealth}/${this.enemyHero.stats.health}`;
    
    if (this.heroStatsCard) {
      this.heroStatsCard.refresh();
    }
  }

  updateManaBars() {
    const playerManaPercent = (this.playerHero.currentMana / this.playerHero.maxMana) * 100;
    const enemyManaPercent = (this.enemyHero.currentMana / this.enemyHero.maxMana) * 100;

    const playerManaBar = this.container.querySelector('.player-mana');
    const enemyManaBar = this.container.querySelector('.enemy-mana');
    const playerManaText = this.container.querySelector('.player .mana-text');
    const enemyManaText = this.container.querySelector('.enemy .mana-text');

    if (playerManaBar) playerManaBar.style.width = `${playerManaPercent}%`;
    if (enemyManaBar) enemyManaBar.style.width = `${enemyManaPercent}%`;
    if (playerManaText) playerManaText.textContent = `${this.playerHero.currentMana}/${this.playerHero.maxMana}`;
    if (enemyManaText) enemyManaText.textContent = `${this.enemyHero.currentMana}/${this.enemyHero.maxMana}`;
  }

  updateHealthAndManaBars() {
    this.updateHealthBars();
    this.updateManaBars();
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
    if (this.isGameOver) return;
    
    this.isGameOver = true;
    this.clearTimers();
    
    if (result === 'victory') {
      this.addToLog(`🎉 Victory! ${this.playerHero.name} wins the battle!`);
    } else {
      this.addToLog(`💀 Defeat! ${this.enemyHero.name} wins the battle!`);
    }

    const battleStatus = this.container.querySelector('#battle-status');
    battleStatus.textContent = result === 'victory' ? 'Victory!' : 'Defeated!';
    battleStatus.className = `auto-battle-status ${result}`;

    const backButton = this.container.querySelector('#back-to-selection');
    backButton.style.display = 'block';

    setTimeout(() => {
      if (this.onBattleEnd) {
        this.onBattleEnd(result);
      }
    }, 3000);
  }


  initCombatShop() {
    this.combatShopContainer = this.container.querySelector('#combat-shop-container');
    this.combatShop = new CombatShop(this.combatShopContainer, this, 1);
    this.combatShop.setPlayerGold(this.playerMoney);
    this.combatShop.setOnGoldChange((newGold) => {
      this.playerMoney = newGold;
      if (this.heroStatsCard) {
        this.heroStatsCard.refresh();
      }
    });
    this.combatShop.init();
  }

  getCombatShopItems() {
    return this.combatShop ? this.combatShop.purchasedItems : [];
  }

  setOnBattleEnd(callback) {
    this.onBattleEnd = callback;
  }

  setDamageMultiplier(multiplier) {
    this.damageMultiplier = multiplier;
  }
}

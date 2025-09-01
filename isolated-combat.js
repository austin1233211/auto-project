import { StatsCalculator } from './stats-calculator.js';
import { AbilitySystem } from './abilities.js';

export class IsolatedCombat {
  constructor(container) {
    this.container = container;
    this.playerHero = null;
    this.enemyHero = null;
    this.matchId = null;
    this.battleLog = [];
    this.isGameOver = false;
    this.onBattleEnd = null;
    this.abilitySystem = new AbilitySystem(this);
    this.playerAttackTimer = null;
    this.enemyAttackTimer = null;
    this.websocketClient = null;
  }

  init(playerHero, enemyHero, matchId, websocketClient = null) {
    this.playerHero = StatsCalculator.processHeroStats({ 
      ...playerHero, 
      currentHealth: playerHero.stats.health,
      currentMana: 0,
      maxMana: 100
    });
    
    this.enemyHero = StatsCalculator.processHeroStats({ 
      ...enemyHero,
      currentHealth: enemyHero.stats.health,
      currentMana: 0,
      maxMana: 100
    });
    
    this.matchId = matchId;
    this.websocketClient = websocketClient;
    this.battleLog = [];
    this.isGameOver = false;
    this.clearTimers();
    
    this.render();
    this.startBattle();
  }

  render() {
    this.container.innerHTML = `
      <div class="isolated-combat-container">
        <h1 class="combat-title">🔥 Your Battle</h1>
        <div class="match-info">
          <p class="match-id">Match ID: ${this.matchId || 'Local'}</p>
          <p class="combat-note">🔒 This is your private battle view</p>
        </div>
        
        <div class="battle-field">
          <div class="hero-battle-card player">
            <div class="hero-avatar">${this.playerHero.avatar}</div>
            <div class="hero-name">${this.playerHero.name} (You)</div>
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
          <h3>Your Battle Log</h3>
          <div class="log-entries" id="log-entries">
            <p>🔥 Your battle begins! ${this.playerHero.name} vs ${this.enemyHero.name}</p>
          </div>
        </div>

        <div class="battle-controls">
          <div class="auto-battle-status" id="battle-status">Your battle in progress...</div>
          <button class="action-button secondary" id="back-to-tournament">Back to Tournament</button>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const backBtn = this.container.querySelector('#back-to-tournament');
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

  clearTimers() {
    if (this.playerAttackTimer) {
      clearInterval(this.playerAttackTimer);
      this.playerAttackTimer = null;
    }
    if (this.enemyAttackTimer) {
      clearInterval(this.enemyAttackTimer);
      this.enemyAttackTimer = null;
    }
  }

  startBattle() {
    this.addToLog(`🎯 Your battle: ${this.playerHero.name} (${Math.round(this.playerHero.effectiveStats.speed)} SPD) vs ${this.enemyHero.name} (${Math.round(this.enemyHero.effectiveStats.speed)} SPD)`);
    this.addToLog(`⚔️ Both heroes attack simultaneously based on their speed.`);
    
    const playerAttackInterval = this.calculateAttackInterval(this.playerHero.effectiveStats.speed);
    const enemyAttackInterval = this.calculateAttackInterval(this.enemyHero.effectiveStats.speed);
    
    this.addToLog(`📊 ${this.playerHero.name} attacks every ${(playerAttackInterval/1000).toFixed(1)}s | ${this.enemyHero.name} attacks every ${(enemyAttackInterval/1000).toFixed(1)}s`);
    
    if (this.websocketClient && this.matchId) {
      this.websocketClient.send({
        type: 'battle_started',
        match_id: this.matchId,
        player_hero: this.playerHero.name,
        enemy_hero: this.enemyHero.name
      });
    }
    
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
  }

  executeAttack(attacker, target) {
    if (this.isGameOver) return;

    let damage;
    let manaGain = 25;

    const passiveResult = this.abilitySystem.processPassiveAbility(attacker, target);
    
    if (attacker.currentMana >= attacker.maxMana) {
      const ultimateAbility = attacker.abilities.ultimate;
      const abilityResult = this.abilitySystem.executeAbility(attacker, target, ultimateAbility.name);
      damage = abilityResult.damage;
      attacker.currentMana = 0;
    } else {
      damage = this.calculateDamage(attacker.effectiveStats.attack, target.effectiveStats.armor);
      if (passiveResult && passiveResult.criticalHit) {
        damage = Math.round(damage * 1.5);
        this.addToLog(`💥 ${attacker.name} attacks with a critical hit for ${damage} damage!`);
      } else {
        this.addToLog(`⚔️ ${attacker.name} attacks for ${damage} damage!`);
      }
      attacker.currentMana = Math.min(attacker.maxMana, attacker.currentMana + manaGain);
    }

    target.currentHealth = Math.max(0, target.currentHealth - damage);
    
    this.abilitySystem.processStatusEffects(this.playerHero);
    this.abilitySystem.processStatusEffects(this.enemyHero);
    
    this.updateHealthAndManaBars();

    if (this.websocketClient && this.matchId) {
      this.websocketClient.send({
        type: 'battle_update',
        match_id: this.matchId,
        player_health: this.playerHero.currentHealth,
        enemy_health: this.enemyHero.currentHealth,
        last_action: `${attacker.name} dealt ${damage} damage`
      });
    }

    if (target.currentHealth <= 0) {
      const result = target === this.enemyHero ? 'victory' : 'defeat';
      this.endBattle(result);
      return;
    }
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

    if (playerHealthBar) playerHealthBar.style.width = `${playerHealthPercent}%`;
    if (enemyHealthBar) enemyHealthBar.style.width = `${enemyHealthPercent}%`;
    if (playerManaBar) playerManaBar.style.width = `${playerManaPercent}%`;
    if (enemyManaBar) enemyManaBar.style.width = `${enemyManaPercent}%`;
    
    if (playerHealthText) playerHealthText.textContent = `${this.playerHero.currentHealth}/${this.playerHero.stats.health}`;
    if (enemyHealthText) enemyHealthText.textContent = `${this.enemyHero.currentHealth}/${this.enemyHero.stats.health}`;
    if (playerManaText) playerManaText.textContent = `${this.playerHero.currentMana}/${this.playerHero.maxMana}`;
    if (enemyManaText) enemyManaText.textContent = `${this.enemyHero.currentMana}/${this.enemyHero.maxMana}`;
  }

  addToLog(message) {
    this.battleLog.push(message);
    const logEntries = this.container.querySelector('#log-entries');
    if (logEntries) {
      const logEntry = document.createElement('p');
      logEntry.textContent = message;
      logEntries.appendChild(logEntry);
      logEntries.scrollTop = logEntries.scrollHeight;
    }
  }

  endBattle(result) {
    this.isGameOver = true;
    this.clearTimers();
    
    if (result === 'victory') {
      this.addToLog(`🎉 Victory! You win the battle!`);
    } else {
      this.addToLog(`💀 Defeat! You lost the battle!`);
    }

    const battleStatus = this.container.querySelector('#battle-status');
    if (battleStatus) {
      battleStatus.textContent = result === 'victory' ? 'Victory!' : 'Defeated!';
      battleStatus.className = `auto-battle-status ${result}`;
    }

    if (this.websocketClient && this.matchId) {
      this.websocketClient.send({
        type: 'battle_ended',
        match_id: this.matchId,
        result: result,
        winner: result === 'victory' ? this.playerHero.name : this.enemyHero.name
      });
    }

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

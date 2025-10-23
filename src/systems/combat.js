import { devTestPanel } from '../components/dev-test-panel.js';

import { heroes } from '../core/heroes.js';
import { StatsCalculator } from '../core/stats-calculator.js';
import { AbilitySystem } from '../core/abilities.js';
import { CombatShop } from '../shops/combat-shop-v2.js';
import { debugTools } from '../components/debug-tools.js';

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
    if (typeof devTestPanel !== 'undefined' && devTestPanel && devTestPanel.attachCombat) {
      devTestPanel.attachCombat(this);
    }

    this.heroStatsCard = heroStatsCard;
  }

  init(playerHero, playerMoney = 0) {
    try {
      if (!playerHero || !playerHero.stats) {
        console.error('Combat.init: Invalid playerHero', playerHero);
        throw new Error('Invalid player hero data');
      }

      this.playerHero = StatsCalculator.processHeroStats({ 
        ...playerHero, 
        currentHealth: playerHero.stats.health,
        currentMana: 0,
        maxMana: 100
      });
      this.playerMoney = playerMoney;
      this.enemyHero = this.selectRandomEnemy();
      
      if (!this.enemyHero) {
        console.error('Combat.init: Failed to select enemy');
        throw new Error('Failed to select enemy hero');
      }
      
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
    } catch (error) {
      console.error('Combat.init error:', error);
      throw error;
    }
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
        const debuffs = (this.playerHero.equipmentState && Array.isArray(this.playerHero.equipmentState.manaRegenDebuffs))
          ? this.playerHero.equipmentState.manaRegenDebuffs.reduce((sum, d) => sum + (d.delta || 0), 0)
          : 0;
        const totalRegen = Math.max(0, 11 + (this.playerHero.effectiveStats.manaRegeneration || 0) + debuffs);
        const regenAmount = Math.ceil(totalRegen * (manaInterval / 1000));
        this.playerHero.currentMana = Math.min(this.playerHero.maxMana, this.playerHero.currentMana + regenAmount);
      }
    }, manaInterval);
    debugTools.registerTimer('combat_player_mana', 'combat_player_mana', manaInterval, 'Player mana regeneration');
    
    this.enemyManaTimer = setInterval(() => {
      if (!this.isGameOver && this.enemyHero.currentMana < this.enemyHero.maxMana) {
        const debuffs = (this.enemyHero.equipmentState && Array.isArray(this.enemyHero.equipmentState.manaRegenDebuffs))
          ? this.enemyHero.equipmentState.manaRegenDebuffs.reduce((sum, d) => sum + (d.delta || 0), 0)
          : 0;
        const totalRegen = Math.max(0, 11 + (this.enemyHero.effectiveStats.manaRegeneration || 0) + debuffs);
        const regenAmount = Math.ceil(totalRegen * (manaInterval / 1000));
        this.enemyHero.currentMana = Math.min(this.enemyHero.maxMana, this.enemyHero.currentMana + regenAmount);
      }
    }, manaInterval);
    debugTools.registerTimer('combat_enemy_mana', 'combat_enemy_mana', manaInterval, 'Enemy mana regeneration');
    
    this.manaUITimer = setInterval(() => {
      if (!this.isGameOver) {
        this.updateManaBars();
      }
    }, 250);
    debugTools.registerTimer('combat_mana_ui', 'combat_ui', 250, 'Mana UI updates');
  }

  startStatusEffectsTimer() {
    this.statusEffectsTimer = setInterval(() => {
      if (!this.isGameOver) {
        this.abilitySystem.processStatusEffects(this.playerHero);
        this.abilitySystem.processStatusEffects(this.enemyHero);
        
        this.abilitySystem.triggerAbilities(this.playerHero, this.enemyHero, 'status_tick');
        this.abilitySystem.triggerAbilities(this.enemyHero, this.playerHero, 'status_tick');
        
        this.abilitySystem.triggerAbilities(this.playerHero, this.enemyHero, 'low_hp_check');
        this.abilitySystem.triggerAbilities(this.enemyHero, this.playerHero, 'low_hp_check');
        
        this.updateHealthBars();
      }
    }, 1000);
    debugTools.registerTimer('combat_status_effects', 'combat_effects', 1000, 'Status effects processing');
    
    this.enhancedRegenTimer = setInterval(() => {
      if (!this.isGameOver) {
        this.abilitySystem.triggerAbilities(this.playerHero, this.enemyHero, 'enhanced_tick');
        this.abilitySystem.triggerAbilities(this.enemyHero, this.playerHero, 'enhanced_tick');
        this.updateHealthBars();
      }
    }, 800);
    debugTools.registerTimer('combat_enhanced_regen', 'combat_effects', 800, 'Enhanced regeneration processing');
    
    this.hpLossTimer = setInterval(() => {
      if (!this.isGameOver) {
        this.abilitySystem.triggerAbilities(this.playerHero, this.enemyHero, 'hp_loss_tick');
        this.abilitySystem.triggerAbilities(this.enemyHero, this.playerHero, 'hp_loss_tick');
      }
    }, 1500);
    debugTools.registerTimer('combat_hp_loss', 'combat_effects', 1500, 'HP loss abilities processing');
    
    this.drumsTimer = setInterval(() => {
      if (!this.isGameOver) {
        this.abilitySystem.triggerAbilities(this.playerHero, this.enemyHero, 'drums_tick');
        this.abilitySystem.triggerAbilities(this.enemyHero, this.playerHero, 'drums_tick');
        this.updateHealthBars();
      }
    }, 2000);
    debugTools.registerTimer('combat_drums', 'combat_effects', 2000, 'Drums of Slom processing');
    
    this.frostNovaTimer = setInterval(() => {
      if (!this.isGameOver) {
        this.abilitySystem.triggerAbilities(this.playerHero, this.enemyHero, 'frost_nova_tick');
        this.abilitySystem.triggerAbilities(this.enemyHero, this.playerHero, 'frost_nova_tick');
        this.updateHealthBars();
      }
    }, 2000);
    debugTools.registerTimer('combat_frost_nova', 'combat_effects', 2000, 'Frost Nova processing');
    
    this.shieldLossTimer = setInterval(() => {
      if (!this.isGameOver) {
        this.abilitySystem.triggerAbilities(this.playerHero, this.enemyHero, 'shield_loss_tick');
        this.abilitySystem.triggerAbilities(this.enemyHero, this.playerHero, 'shield_loss_tick');
        this.updateHealthBars();
      }
    }, 1800);
    debugTools.registerTimer('combat_shield_loss', 'combat_effects', 1800, 'Shield loss damage processing');
  }

  clearTimers() {
    debugTools.logDebug('🧹 Combat: Clearing all timers');
    
    if (this.playerAttackTimer) {
      clearInterval(this.playerAttackTimer);
      debugTools.unregisterTimer('combat_player_attack');
      this.playerAttackTimer = null;
    }
    if (this.enemyAttackTimer) {
      clearInterval(this.enemyAttackTimer);
      debugTools.unregisterTimer('combat_enemy_attack');
      this.enemyAttackTimer = null;
    }
    if (this.playerManaTimer) {
      clearInterval(this.playerManaTimer);
      debugTools.unregisterTimer('combat_player_mana');
      this.playerManaTimer = null;
    }
    if (this.enemyManaTimer) {
      clearInterval(this.enemyManaTimer);
      debugTools.unregisterTimer('combat_enemy_mana');
      this.enemyManaTimer = null;
    }
    if (this.manaUITimer) {
      clearInterval(this.manaUITimer);
      debugTools.unregisterTimer('combat_mana_ui');
      this.manaUITimer = null;
    }
    if (this.statusEffectsTimer) {
      clearInterval(this.statusEffectsTimer);
      debugTools.unregisterTimer('combat_status_effects');
      this.statusEffectsTimer = null;
    }
    if (this.enhancedRegenTimer) {
      clearInterval(this.enhancedRegenTimer);
      debugTools.unregisterTimer('combat_enhanced_regen');
      this.enhancedRegenTimer = null;
    }
    if (this.hpLossTimer) {
      clearInterval(this.hpLossTimer);
      debugTools.unregisterTimer('combat_hp_loss');
      this.hpLossTimer = null;
    }
    if (this.drumsTimer) {
      clearInterval(this.drumsTimer);
      debugTools.unregisterTimer('combat_drums');
      this.drumsTimer = null;
    }
    if (this.frostNovaTimer) {
      clearInterval(this.frostNovaTimer);
      debugTools.unregisterTimer('combat_frost_nova');
      this.frostNovaTimer = null;
    }
    if (this.shieldLossTimer) {
      clearInterval(this.shieldLossTimer);
      debugTools.unregisterTimer('combat_shield_loss');
      this.shieldLossTimer = null;
    }
  }

  startBattle() {
    this.isGameOver = false;
    this.playerHero.currentMana = 0;
    this.enemyHero.currentMana = 0;
    
    this.abilitySystem.triggerAbilities(this.playerHero, this.enemyHero, 'battle_start');
    this.abilitySystem.triggerAbilities(this.enemyHero, this.playerHero, 'battle_start');
    
    this.updateHealthBars();
    this.updateManaBars();
    
    this.initializeCombatTimers();
  }

  initializeCombatTimers() {
    this.clearTimers();
    
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
    debugTools.registerTimer('combat_player_attack', 'combat_player_attack', playerAttackInterval, `Player attacks (${this.playerHero.effectiveStats.speed.toFixed(2)}/sec)`);
    
    this.enemyAttackTimer = setInterval(() => {
      if (!this.isGameOver) {
        this.executeAttack(this.enemyHero, this.playerHero);
      }
    }, enemyAttackInterval);
    debugTools.registerTimer('combat_enemy_attack', 'combat_enemy_attack', enemyAttackInterval, `Enemy attacks (${this.enemyHero.effectiveStats.speed.toFixed(2)}/sec)`);
    
    this.startManaRegeneration();
    this.startStatusEffectsTimer();
  }

  executeAttack(attacker, target) {
    if (this.isGameOver) return;

    try {
      if (!attacker || !target) {
        console.error('Combat.executeAttack: Invalid attacker or target', { attacker, target });
        return;
      }

      let damage;
      let wasEvaded = false;
      let wasCrit = false;

      this.abilitySystem.triggerAbilities(attacker, target, 'on_attack');

    const passiveResult = this.abilitySystem.processPassiveAbility(attacker, target);
    
    if (attacker.currentMana >= attacker.maxMana) {
      const ultimateAbility = attacker.abilities.ultimate;
      const abilityResult = this.abilitySystem.executeAbility(attacker, target, ultimateAbility.name);
      damage = abilityResult.damage;
      attacker.currentMana = 0;
      
      this.abilitySystem.triggerAbilities(attacker, target, 'on_ultimate');
    } else {
      let finalDamage = this.calculateDamage(attacker.effectiveStats.attack, target, 'physical', attacker);

      if (attacker.equipmentState && attacker.equipmentState.forceNoEvasion) {
        wasEvaded = false;
        attacker.equipmentState.forceNoEvasion = false;
      } else if (target.equipmentState && target.equipmentState.autoEvadeReady) {
        wasEvaded = true;
        target.equipmentState.autoEvadeReady = false;
        finalDamage = Math.round(finalDamage * (1 - (target.effectiveStats.evasionDamageReduction || 0)));
        this.addToLog(`${target.name} evades with equipment, reducing damage to ${finalDamage}!`);
        this.abilitySystem.triggerAbilities(target, attacker, 'on_evade');
      } else {
        const enemyMissBonus = (target.equipmentState && target.equipmentState.enemyMissChanceBonusPct) ? target.equipmentState.enemyMissChanceBonusPct / 100 : 0;
        if (enemyMissBonus > 0 && Math.random() < enemyMissBonus) {
          wasEvaded = true;
          finalDamage = Math.round(finalDamage * (1 - (target.effectiveStats.evasionDamageReduction || 0)));
          this.addToLog(`${attacker.name}'s attack misses due to aura!`);
          this.abilitySystem.triggerAbilities(target, attacker, 'on_evade');
        } else if (Math.random() < target.effectiveStats.evasionChance) {
          wasEvaded = true;
          finalDamage = Math.round(finalDamage * (1 - (target.effectiveStats.evasionDamageReduction || 0)));
          this.addToLog(`${target.name} partially evades, reducing damage to ${finalDamage}!`);
          this.abilitySystem.triggerAbilities(target, attacker, 'on_evade');
        }
      }
      
      let totalCritChance = attacker.effectiveStats.critChance;
      if (passiveResult && passiveResult.criticalHit) {
        totalCritChance += 0.15;
      }
      if (attacker.equipmentState && attacker.equipmentState.forceCrit) {
        totalCritChance = 1.0;
        attacker.equipmentState.forceCrit = false;
      }
      
      if (Math.random() < totalCritChance) {
        wasCrit = true;
        finalDamage = Math.round(finalDamage * (attacker.effectiveStats.critDamage || 1.5));
        this.addToLog(`${attacker.name} attacks with a critical hit for ${finalDamage} damage!`);
        this.abilitySystem.triggerAbilities(attacker, target, 'on_crit');
      } else {
        this.addToLog(`${attacker.name} attacks for ${finalDamage} damage!`);
      }
      
      damage = finalDamage;

      if (attacker.equipmentState && attacker.equipmentState.onHitBonusMagic) {
        const bonus = attacker.equipmentState.onHitBonusMagic;
        attacker.equipmentState.onHitBonusMagic = 0;
        const bonusDmg = this.calculateDamage(bonus, target, 'magic');
        target.currentHealth = Math.max(0, target.currentHealth - bonusDmg);
        this.addToLog(`${attacker.name}'s equipment deals ${bonusDmg} bonus magic damage!`);
      }
    }

    if (target.currentHealth - damage <= 0) {
      if (target.effectiveStats.deathSaveCharges > 0) {
        target.effectiveStats.deathSaveCharges--;
        target.currentHealth = 1;
        this.addToLog(`${target.name} survives fatal damage!`);
        return;
      }
      
      const deathSaved = this.abilitySystem.triggerAbilities(target, attacker, 'death_save');
      if (deathSaved) {
        return;
      }
    }

    const oldHealth = target.currentHealth;
    if (target.equipmentState && typeof target.equipmentState.reduceIncomingFlat === 'number' && target.equipmentState.reduceIncomingFlat > 0) {
      damage = Math.max(0, damage - target.equipmentState.reduceIncomingFlat);
      target.equipmentState.reduceIncomingFlat = 0;
    }
    target.currentHealth = Math.max(0, target.currentHealth - damage);
    
    if (damage > 0) {
      this.abilitySystem.triggerAbilities(target, attacker, 'on_damage_taken', { wasCrit, damageType: 'physical' });
      this.abilitySystem.triggerAbilities(attacker, target, 'on_damage_dealt');
      
      if (damage > 80) {
        this.abilitySystem.triggerAbilities(target, attacker, 'high_damage_taken', { damageAmount: damage });
      }
    }
    
      this.updateHealthBars();

      if (target.currentHealth <= 0) {
        const result = target === this.enemyHero ? 'victory' : 'defeat';
        this.endBattle(result);
        return;
      }
    } catch (error) {
      console.error('Combat.executeAttack error:', error);
      this.addToLog(`⚠️ Error during attack: ${error.message}`);
    }
  }

  calculateDamage(attack, target, damageType = 'physical', attacker = null) {
    const baseDamage = attack;
    
    let damageReduction = 0;
    if (damageType === 'physical') {
      damageReduction = target.effectiveStats.armor;
    } else if (damageType === 'magic') {
      damageReduction = (target.effectiveStats.magicDamageReduction || 0);
    }
    
    let finalDamage = baseDamage * (1 - damageReduction / 100);
    
    let damageAmplification = 0;
    if (damageType === 'physical') {
      damageAmplification = target.effectiveStats.physicalDamageAmplification || 0;
    } else if (damageType === 'magic') {
      damageAmplification = target.effectiveStats.magicDamageAmplification || 0;
    }
    
    finalDamage = finalDamage * (1 + damageAmplification / 100);
    
    if (damageType === 'physical' && (target.effectiveStats.physicalDamageReduction || 0) > 0) {
      finalDamage = finalDamage * (1 - (target.effectiveStats.physicalDamageReduction / 100));
    }
    
    const now = Date.now ? Date.now() : 0;
    if (attacker && attacker.equipmentState && attacker.equipmentState.damageOutputReduction) {
      const dor = attacker.equipmentState.damageOutputReduction;
      if (!dor.until || dor.until > now) {
        if (damageType === 'physical' && dor.phys) {
          finalDamage = Math.round(finalDamage * (1 - dor.phys / 100));
        } else if (damageType === 'magic' && dor.magic) {
          finalDamage = Math.round(finalDamage * (1 - dor.magic / 100));
        }
      }
    }
    
    const shieldEffect = target.statusEffects?.find(e => e.type === 'shield_stacks');
    if (shieldEffect && shieldEffect.stacks > 0) {
      const shieldReduction = Math.min(finalDamage, shieldEffect.stacks);
      finalDamage -= shieldReduction;
      shieldEffect.stacks -= shieldReduction;
      shieldEffect.stacks = Math.floor(shieldEffect.stacks * 0.7);
      if (shieldReduction > 0) {
        this.addToLog(`Shield absorbs ${shieldReduction} damage!`);
      }
    }
    
    finalDamage = finalDamage * this.damageMultiplier;
    
    return Math.max(1, Math.round(finalDamage));
  }

  updateHealthBars() {
    if (!this.playerHero || !this.enemyHero) return;
    
    const playerHealthPercent = (this.playerHero.currentHealth / this.playerHero.stats.health) * 100;
    const enemyHealthPercent = (this.enemyHero.currentHealth / this.enemyHero.stats.health) * 100;

    if (!this.cachedHealthElements) {
      this.cachedHealthElements = {
        playerHealthBar: this.container.querySelector('.player-health'),
        enemyHealthBar: this.container.querySelector('.enemy-health'),
        playerHealthText: this.container.querySelector('.player .health-text'),
        enemyHealthText: this.container.querySelector('.enemy .health-text')
      };
    }

    const { playerHealthBar, enemyHealthBar, playerHealthText, enemyHealthText } = this.cachedHealthElements;

    if (playerHealthBar) playerHealthBar.style.width = `${playerHealthPercent}%`;
    if (enemyHealthBar) enemyHealthBar.style.width = `${enemyHealthPercent}%`;
    if (playerHealthText) playerHealthText.textContent = `${Math.round(this.playerHero.currentHealth)}/${this.playerHero.stats.health}`;
    if (enemyHealthText) enemyHealthText.textContent = `${Math.round(this.enemyHero.currentHealth)}/${this.enemyHero.stats.health}`;
    
    if (this.heroStatsCard) {
      this.heroStatsCard.refresh();
    }
  }

  updateManaBars() {
    if (!this.playerHero || !this.enemyHero) return;
    
    const playerManaPercent = (this.playerHero.currentMana / this.playerHero.maxMana) * 100;
    const enemyManaPercent = (this.enemyHero.currentMana / this.enemyHero.maxMana) * 100;

    if (!this.cachedManaElements) {
      this.cachedManaElements = {
        playerManaBar: this.container.querySelector('.player-mana'),
        enemyManaBar: this.container.querySelector('.enemy-mana'),
        playerManaText: this.container.querySelector('.player .mana-text'),
        enemyManaText: this.container.querySelector('.enemy .mana-text')
      };
    }

    const { playerManaBar, enemyManaBar, playerManaText, enemyManaText } = this.cachedManaElements;

    if (playerManaBar) playerManaBar.style.width = `${playerManaPercent}%`;
    if (enemyManaBar) enemyManaBar.style.width = `${enemyManaPercent}%`;
    if (playerManaText) playerManaText.textContent = `${Math.round(this.playerHero.currentMana)}/${this.playerHero.maxMana}`;
    if (enemyManaText) enemyManaText.textContent = `${Math.round(this.enemyHero.currentMana)}/${this.enemyHero.maxMana}`;
  }

  updateHealthAndManaBars() {
    this.updateHealthBars();
    this.updateManaBars();
  }

  addToLog(message) {
    this.battleLog.push(message);
    const logEntries = this.container.querySelector('#log-entries') || this.container.querySelector('#battle-log');
    if (!logEntries) return;
    const logEntry = document.createElement('p');
    logEntry.textContent = message;
    logEntries.appendChild(logEntry);
    logEntries.scrollTop = logEntries.scrollHeight;
  }

  endBattle(result) {
    if (this.isGameOver) return;
    
    debugTools.logDebug(`⚔️ Combat: Battle ending with result: ${result}`);
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
      if (this.onMoneyChange) {
        this.onMoneyChange(newGold);
      }
      if (this.heroStatsCard) {
        this.heroStatsCard.refresh();
      }
    });
    
    if (this.onAbilityPurchased) {
      this.combatShop.setOnAbilityPurchased(this.onAbilityPurchased);
    }
    
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

  setOnMoneyChange(callback) {
    this.onMoneyChange = callback;
  }

  setOnAbilityPurchased(callback) {
    this.onAbilityPurchased = callback;
    if (this.combatShop) {
      this.combatShop.setOnAbilityPurchased(callback);
    }
  }
}

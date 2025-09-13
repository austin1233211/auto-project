const Hero = require('../models/Hero');
const Match = require('../models/Match');

class CombatService {
  static async simulateBattle(match) {
    const player1Hero = await Hero.getPlayerHeroWithModifications(match.player1_id);
    const player2Hero = await Hero.getPlayerHeroWithModifications(match.player2_id);
    
    const battleState = {
      player1: this.initializeBattleHero(player1Hero),
      player2: this.initializeBattleHero(player2Hero),
      events: [],
      timeOffset: 0
    };
    
    const battleResult = await this.runBattleSimulation(battleState, match.id);
    
    return {
      winnerId: battleResult.winner === 'player1' ? match.player1_id : match.player2_id,
      player1DamageDealt: battleResult.player1DamageDealt,
      player2DamageDealt: battleResult.player2DamageDealt,
      player1HealthLost: battleState.player1.maxHealth - battleState.player1.health,
      player2HealthLost: battleState.player2.maxHealth - battleState.player2.health,
      battleLog: JSON.stringify(battleResult.events)
    };
  }
  
  static initializeBattleHero(heroData) {
    const baseStats = this.calculateEffectiveStats(heroData);
    
    return {
      id: heroData.id,
      name: heroData.name,
      health: baseStats.health,
      maxHealth: baseStats.health,
      attack: baseStats.attack,
      armor: baseStats.armor,
      speed: baseStats.speed,
      mana: 0,
      maxMana: 100,
      abilities: heroData.purchased_abilities || [],
      artifacts: heroData.artifacts || [],
      equipment: heroData.equipment || [],
      passiveAbility: {
        name: heroData.passive_ability_name,
        description: heroData.passive_ability_description
      },
      ultimateAbility: {
        name: heroData.ultimate_ability_name,
        description: heroData.ultimate_ability_description
      }
    };
  }
  
  static calculateEffectiveStats(heroData) {
    let stats = {
      health: heroData.base_health,
      attack: heroData.base_attack,
      armor: heroData.base_armor,
      speed: heroData.base_speed
    };
    
    (heroData.purchased_abilities || []).forEach(ability => {
      this.applyAbilityToStats(stats, ability);
    });
    
    (heroData.artifacts || []).forEach(artifact => {
      this.applyArtifactToStats(stats, artifact);
    });
    
    (heroData.equipment || []).forEach(equipment => {
      this.applyEquipmentToStats(stats, equipment);
    });
    
    return this.applyDiminishingReturns(stats);
  }
  
  static applyAbilityToStats(stats, ability) {
    switch (ability.effect) {
      case 'attack_boost':
        stats.attack += ability.value;
        break;
      case 'health_boost':
        stats.health += ability.value;
        break;
      case 'armor_boost':
        stats.armor += ability.value;
        break;
      case 'speed_boost':
        stats.speed += ability.value;
        break;
      case 'attack_multiplier':
        stats.attack = Math.floor(stats.attack * (1 + ability.value / 100));
        break;
      case 'health_multiplier':
        stats.health = Math.floor(stats.health * (1 + ability.value / 100));
        break;
    }
  }
  
  static applyArtifactToStats(stats, artifact) {
    switch (artifact.effect) {
      case 'damage_reduction':
        stats.armor += artifact.value;
        break;
      case 'gold_bonus':
        break;
      case 'mana_efficiency':
        break;
    }
  }
  
  static applyEquipmentToStats(stats, equipment) {
    switch (equipment.stat) {
      case 'attack':
        stats.attack += equipment.value;
        break;
      case 'health':
        stats.health += equipment.value;
        break;
      case 'armor':
        stats.armor += equipment.value;
        break;
      case 'speed':
        stats.speed += equipment.value;
        break;
    }
  }
  
  static applyDiminishingReturns(stats) {
    const diminishingReturns = (value, threshold = 100, factor = 0.5) => {
      if (value <= threshold) return value;
      const excess = value - threshold;
      return threshold + Math.floor(excess * factor);
    };
    
    return {
      health: Math.max(1, stats.health),
      attack: Math.max(1, diminishingReturns(stats.attack, 100, 0.6)),
      armor: Math.max(0, diminishingReturns(stats.armor, 50, 0.4)),
      speed: Math.max(1, diminishingReturns(stats.speed, 100, 0.7))
    };
  }
  
  static async runBattleSimulation(battleState, matchId) {
    const maxRounds = 100;
    let round = 0;
    let player1DamageDealt = 0;
    let player2DamageDealt = 0;
    
    while (battleState.player1.health > 0 && battleState.player2.health > 0 && round < maxRounds) {
      round++;
      
      const player1AttackTime = 1000 / battleState.player1.speed;
      const player2AttackTime = 1000 / battleState.player2.speed;
      
      if (round % Math.ceil(player1AttackTime / 100) === 0) {
        const damage = this.calculateDamage(battleState.player1, battleState.player2);
        battleState.player2.health = Math.max(0, battleState.player2.health - damage);
        player1DamageDealt += damage;
        
        battleState.player1.mana = Math.min(100, battleState.player1.mana + 15);
        
        const event = {
          type: 'attack',
          attacker: 'player1',
          damage,
          targetHealth: battleState.player2.health,
          attackerMana: battleState.player1.mana
        };
        
        battleState.events.push(event);
        await Match.addEvent(matchId, 'attack', event, battleState.timeOffset);
        
        if (battleState.player1.mana >= 100) {
          await this.triggerUltimate(battleState, 'player1', matchId);
        }
      }
      
      if (battleState.player2.health > 0 && round % Math.ceil(player2AttackTime / 100) === 0) {
        const damage = this.calculateDamage(battleState.player2, battleState.player1);
        battleState.player1.health = Math.max(0, battleState.player1.health - damage);
        player2DamageDealt += damage;
        
        battleState.player2.mana = Math.min(100, battleState.player2.mana + 15);
        
        const event = {
          type: 'attack',
          attacker: 'player2',
          damage,
          targetHealth: battleState.player1.health,
          attackerMana: battleState.player2.mana
        };
        
        battleState.events.push(event);
        await Match.addEvent(matchId, 'attack', event, battleState.timeOffset);
        
        if (battleState.player2.mana >= 100) {
          await this.triggerUltimate(battleState, 'player2', matchId);
        }
      }
      
      battleState.timeOffset += 100;
    }
    
    const winner = battleState.player1.health > 0 ? 'player1' : 'player2';
    
    const endEvent = {
      type: 'battle_end',
      winner,
      player1Health: battleState.player1.health,
      player2Health: battleState.player2.health
    };
    
    battleState.events.push(endEvent);
    await Match.addEvent(matchId, 'battle_end', endEvent, battleState.timeOffset);
    
    return {
      winner,
      player1DamageDealt,
      player2DamageDealt,
      events: battleState.events
    };
  }
  
  static calculateDamage(attacker, defender) {
    const baseDamage = attacker.attack;
    const armorReduction = Math.max(0, defender.armor);
    const damageReduction = armorReduction / (armorReduction + 100);
    const finalDamage = Math.max(1, Math.floor(baseDamage * (1 - damageReduction)));
    
    return finalDamage;
  }
  
  static async triggerUltimate(battleState, player, matchId) {
    const hero = battleState[player];
    hero.mana = 0;
    
    const ultimateDamage = Math.floor(hero.attack * 2.5);
    const opponent = player === 'player1' ? battleState.player2 : battleState.player1;
    
    opponent.health = Math.max(0, opponent.health - ultimateDamage);
    
    const event = {
      type: 'ultimate',
      caster: player,
      abilityName: hero.ultimateAbility.name,
      damage: ultimateDamage,
      targetHealth: opponent.health
    };
    
    battleState.events.push(event);
    await Match.addEvent(matchId, 'ultimate', event, battleState.timeOffset);
  }
}

module.exports = CombatService;

export class AbilitySystem {
  constructor(combat) {
    this.combat = combat;
  }

  executeAbility(caster, target, abilityName) {
    switch (abilityName) {
      case 'Fireball':
        return this.executeFireball(caster, target);
      default:
        return this.executeGenericAbility(caster, target, abilityName);
    }
  }

  executeFireball(caster, target) {
    const baseDamage = caster.effectiveStats.attack * 1.6;
    const damage = this.combat.calculateDamage(baseDamage, target.effectiveStats.armor);
    
    target.currentHealth = Math.max(0, target.currentHealth - damage);
    
    this.combat.addToLog(`🔥 ${caster.name} launches a burning Fireball for ${damage} damage!`);
    
    return {
      damage: damage,
      effects: []
    };
  }

  executeGenericAbility(caster, target, abilityName) {
    const damage = this.combat.calculateDamage(caster.effectiveStats.attack * 1.5, target.effectiveStats.armor);
    target.currentHealth = Math.max(0, target.currentHealth - damage);
    this.combat.addToLog(`✨ ${caster.name} uses ${abilityName} for ${damage} damage!`);
    
    return {
      damage: damage,
      effects: []
    };
  }
}

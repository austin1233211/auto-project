export const ARTIFACTS_BY_ROUND = {
  3: [
    { name: 'Ancient Tome', effect: 'mana_efficiency', value: 25, emoji: '📚', description: 'Abilities cost 25% less mana' },
    { name: 'Lucky Charm', effect: 'gold_bonus', value: 50, emoji: '🍀', description: '+50% gold from victories' },
    { name: 'Warrior\'s Banner', effect: 'attack_aura', value: 15, emoji: '🚩', description: '+15% attack power' },
    { name: 'Shield of Valor', effect: 'damage_reduction', value: 20, emoji: '🛡️', description: '-20% damage taken' },
    { name: 'Swift Boots', effect: 'speed_aura', value: 20, emoji: '👢', description: '+20% movement and attack speed' }
  ],
  8: [
    { name: 'Battle Standard', effect: 'team_boost', value: 10, emoji: '🚩', description: '+10% damage to all abilities' },
    { name: 'Ancient Tome', effect: 'mana_efficiency', value: 25, emoji: '📚', description: 'Abilities cost 25% less mana' },
    { name: 'Crystal of Power', effect: 'ability_enhance', value: 30, emoji: '💎', description: '+30% ability effectiveness' },
    { name: 'Ring of Regeneration', effect: 'health_regen', value: 5, emoji: '💍', description: 'Regenerate 5% health per turn' },
    { name: 'Cloak of Shadows', effect: 'stealth_bonus', value: 25, emoji: '🌑', description: '+25% chance to avoid attacks' },
    { name: 'Orb of Wisdom', effect: 'experience_boost', value: 40, emoji: '🔮', description: '+40% experience from battles' }
  ],
  13: [
    { name: 'Crown of Kings', effect: 'ultimate_artifact', value: 20, emoji: '👑', description: '+20% to all stats and abilities' },
    { name: 'Lucky Charm', effect: 'gold_bonus', value: 50, emoji: '🍀', description: '+50% gold from victories' },
    { name: 'Sword of Legends', effect: 'legendary_weapon', value: 100, emoji: '⚔️', description: '+100 attack and 50% crit chance' },
    { name: 'Armor of Eternity', effect: 'legendary_armor', value: 50, emoji: '🛡️', description: '+50 armor and immunity to debuffs' },
    { name: 'Amulet of Time', effect: 'time_manipulation', value: 2, emoji: '⏰', description: 'Take 2 actions per turn' },
    { name: 'Phoenix Feather', effect: 'resurrection', value: 1, emoji: '🔥', description: 'Revive with full health once per tournament' }
  ]
};

export class ArtifactSystem {
  constructor() {
    this.selectedArtifacts = [];
  }

  getArtifactsForRound(roundNumber) {
    return ARTIFACTS_BY_ROUND[roundNumber] || [];
  }

  selectRandomArtifacts(roundNumber, count = 3) {
    const availableArtifacts = this.getArtifactsForRound(roundNumber);
    const shuffled = [...availableArtifacts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, availableArtifacts.length));
  }

  applyArtifactToHero(hero, artifact) {
    const modifiedHero = { ...hero };
    
    if (!modifiedHero.artifacts) {
      modifiedHero.artifacts = [];
    }
    modifiedHero.artifacts.push(artifact);

    switch (artifact.effect) {
      case 'mana_efficiency':
        modifiedHero.stats.manaEfficiency = (modifiedHero.stats.manaEfficiency || 0) + artifact.value;
        break;
      case 'gold_bonus':
        modifiedHero.stats.goldBonus = (modifiedHero.stats.goldBonus || 0) + artifact.value;
        break;
      case 'attack_aura':
        modifiedHero.stats.attack = Math.round(modifiedHero.stats.attack * (1 + artifact.value / 100));
        break;
      case 'damage_reduction':
        modifiedHero.stats.damageReduction = (modifiedHero.stats.damageReduction || 0) + artifact.value;
        break;
      case 'speed_aura':
        modifiedHero.stats.speed = Math.round(modifiedHero.stats.speed * (1 + artifact.value / 100));
        break;
      case 'team_boost':
        modifiedHero.stats.abilityDamageBonus = (modifiedHero.stats.abilityDamageBonus || 0) + artifact.value;
        break;
      case 'ability_enhance':
        modifiedHero.stats.abilityEffectiveness = (modifiedHero.stats.abilityEffectiveness || 0) + artifact.value;
        break;
      case 'health_regen':
        modifiedHero.stats.healthRegeneration = (modifiedHero.stats.healthRegeneration || 0) + artifact.value;
        break;
      case 'stealth_bonus':
        modifiedHero.stats.evasionChance = (modifiedHero.stats.evasionChance || 0) + (artifact.value / 100);
        break;
      case 'ultimate_artifact':
        modifiedHero.stats.attack = Math.round(modifiedHero.stats.attack * (1 + artifact.value / 100));
        modifiedHero.stats.health = Math.round(modifiedHero.stats.health * (1 + artifact.value / 100));
        modifiedHero.stats.speed = Math.round(modifiedHero.stats.speed * (1 + artifact.value / 100));
        modifiedHero.stats.armor = Math.round(modifiedHero.stats.armor * (1 + artifact.value / 100));
        break;
      case 'legendary_weapon':
        modifiedHero.stats.attack += artifact.value;
        modifiedHero.stats.critChance = (modifiedHero.stats.critChance || 0) + 0.50;
        break;
      case 'legendary_armor':
        modifiedHero.stats.armor += artifact.value;
        modifiedHero.stats.debuffImmunity = true;
        break;
      case 'time_manipulation':
        modifiedHero.stats.extraActions = (modifiedHero.stats.extraActions || 0) + artifact.value;
        break;
      case 'resurrection':
        modifiedHero.stats.reviveCount = (modifiedHero.stats.reviveCount || 0) + artifact.value;
        break;
    }

    return modifiedHero;
  }
}

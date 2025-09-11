import { ItemShop } from './item-shop.js';

export class AbilitiesShop extends ItemShop {
  constructor(container, roundNumber = 1) {
    super(container, roundNumber);
    this.shopType = 'abilities';
  }

  generateItemByTier(tier) {
    const tierCosts = { 1: 100, 2: 200, 3: 300 };
    const cost = tierCosts[tier];
    
    const abilityTemplates = {
      1: [
        { name: 'Power Strike', effect: 'attack_boost', value: 15, emoji: '⚔️', description: '+15 Attack Power' },
        { name: 'Swift Reflexes', effect: 'speed_boost', value: 10, emoji: '💨', description: '+10 Speed' },
        { name: 'Iron Will', effect: 'health_boost', value: 50, emoji: '❤️', description: '+50 Health' },
        { name: 'Thick Skin', effect: 'armor_boost', value: 8, emoji: '🛡️', description: '+8 Armor' },
        { name: 'Battle Focus', effect: 'crit_chance', value: 15, emoji: '🎯', description: '+15% Critical Hit Chance' },
        { name: 'Evasive Maneuvers', effect: 'evasion_chance', value: 12, emoji: '👻', description: '+12% Evasion Chance' },
        { name: 'Mana Efficiency', effect: 'mana_regen', value: 20, emoji: '💙', description: '+20% Mana Regeneration' },
        { name: 'Combat Training', effect: 'physical_amp', value: 10, emoji: '💪', description: '+10% Physical Damage' },
        { name: 'Arcane Studies', effect: 'magic_amp', value: 10, emoji: '🔮', description: '+10% Magic Damage' },
        { name: 'Defensive Stance', effect: 'magic_resist', value: 15, emoji: '🌟', description: '+15% Magic Resistance' },
        { name: 'Berserker Training', effect: 'attack_speed', value: 12, emoji: '⚡', description: '+12% Attack Speed' },
        { name: 'Lucky Strike', effect: 'gold_bonus', value: 25, emoji: '💰', description: '+25% Gold from Victories' },
        { name: 'Veteran Experience', effect: 'stat_boost', value: 5, emoji: '⭐', description: '+5 to All Stats' },
        { name: 'Combat Reflexes', effect: 'counter_chance', value: 20, emoji: '🔄', description: '20% Chance to Counter Attack' }
      ],
      2: [
        { name: 'Berserker Rage', effect: 'low_health_damage', value: 30, emoji: '🔥', description: '+30% Damage when below 50% HP' },
        { name: 'Divine Protection', effect: 'damage_immunity', value: 15, emoji: '✨', description: '15% Chance to Ignore Damage' },
        { name: 'Master Tactician', effect: 'ability_cooldown', value: 25, emoji: '🧠', description: '-25% Ability Cooldowns' }
      ],
      3: [
        { name: 'Divine Ascension', effect: 'ultimate_power', value: 25, emoji: '👑', description: '+25% to All Stats' },
        { name: 'Legendary Prowess', effect: 'crit_multiplier', value: 50, emoji: '💥', description: '+50% Critical Hit Damage' },
        { name: 'Immortal Spirit', effect: 'death_save', value: 1, emoji: '🛡️', description: 'Survive Fatal Damage Once Per Battle' }
      ]
    };
    
    const templates = abilityTemplates[tier];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return { 
      ...template, 
      cost, 
      tier, 
      tierName: `Tier ${tier}`,
      type: 'ability'
    };
  }

  applyItemsToHero(hero) {
    const modifiedHero = { ...hero };
    
    this.purchasedItems.forEach(ability => {
      if (!modifiedHero.purchasedAbilities) {
        modifiedHero.purchasedAbilities = [];
      }
      modifiedHero.purchasedAbilities.push(ability);
      
      switch (ability.effect) {
        case 'attack_boost':
          modifiedHero.stats.attack += ability.value;
          break;
        case 'speed_boost':
          modifiedHero.stats.speed += ability.value;
          break;
        case 'health_boost':
          modifiedHero.stats.health += ability.value;
          break;
        case 'armor_boost':
          modifiedHero.stats.armor += ability.value;
          break;
        case 'crit_chance':
          modifiedHero.stats.critChance = (modifiedHero.stats.critChance || 0) + ability.value;
          break;
        case 'evasion_chance':
          modifiedHero.stats.evasionChance = (modifiedHero.stats.evasionChance || 0) + ability.value;
          break;
        case 'physical_amp':
          modifiedHero.stats.physicalDamageAmplification = (modifiedHero.stats.physicalDamageAmplification || 0) + ability.value;
          break;
        case 'magic_amp':
          modifiedHero.stats.magicDamageAmplification = (modifiedHero.stats.magicDamageAmplification || 0) + ability.value;
          break;
        case 'magic_resist':
          modifiedHero.stats.magicDamageReduction = (modifiedHero.stats.magicDamageReduction || 0) + ability.value;
          break;
        case 'stat_boost':
          modifiedHero.stats.attack += ability.value;
          modifiedHero.stats.health += ability.value * 10;
          modifiedHero.stats.speed += ability.value;
          modifiedHero.stats.armor += ability.value;
          break;
      }
    });

    return modifiedHero;
  }

  updateItemSlot(slotIndex, item) {
    const slot = this.itemSlots[slotIndex];
    if (!slot) return;

    if (item) {
      slot.innerHTML = `
        <div class="item-info">
          <div class="item-header">
            <span class="item-emoji">${item.emoji}</span>
            <span class="item-name">${item.name}</span>
          </div>
          <div class="item-description">${item.description}</div>
          <div class="item-footer">
            <span class="item-tier">${item.tierName}</span>
            <span class="item-cost">💰 ${item.cost}</span>
          </div>
        </div>
        <button class="buy-button" data-slot="${slotIndex}">
          Buy Ability
        </button>
      `;
      slot.className = `item-slot tier-${item.tier}`;
    } else {
      slot.innerHTML = '<div class="empty-slot">No ability available</div>';
      slot.className = 'item-slot empty';
    }
  }
}

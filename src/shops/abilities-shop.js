import { ItemShop } from './item-shop.js';
import { ATTACK_SECT_ABILITIES } from '../abilities/attack-sect.js';
import { EVADE_SECT_ABILITIES } from '../abilities/evade-sect.js';

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
        ...ATTACK_SECT_ABILITIES[1],
        ...EVADE_SECT_ABILITIES[1]
      ],
      2: [
        ...ATTACK_SECT_ABILITIES[2],
        ...EVADE_SECT_ABILITIES[2]
      ],
      3: [
        ...ATTACK_SECT_ABILITIES[3],
        ...EVADE_SECT_ABILITIES[3]
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
    
    if (!modifiedHero.purchasedAbilities) {
      modifiedHero.purchasedAbilities = [];
    }
    
    const existingAbilityIds = new Set(modifiedHero.purchasedAbilities.map(a => `${a.name}-${a.effect}-${a.value}`));
    const newAbilities = this.purchasedItems.filter(ability => {
      const abilityId = `${ability.name}-${ability.effect}-${ability.value}`;
      return !existingAbilityIds.has(abilityId);
    });
    
    newAbilities.forEach(ability => {
      modifiedHero.purchasedAbilities.push(ability);
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

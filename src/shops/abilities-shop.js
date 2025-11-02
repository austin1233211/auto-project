import { ItemShop } from './item-shop.js';
import { ATTACK_SECT_ABILITIES } from '../abilities/attack-sect.js';
import { EVADE_SECT_ABILITIES } from '../abilities/evade-sect.js';
import { CRIT_SECT_ABILITIES } from '../abilities/crit-sect.js';
import { HEALTH_SECT_ABILITIES } from '../abilities/health-sect.js';
import { REGEN_SECT_ABILITIES } from '../abilities/regen-sect.js';
import { POISON_SECT_ABILITIES } from '../abilities/poison-sect.js';
import { FROST_SECT_ABILITIES } from '../abilities/frost-sect.js';
import { SHIELD_SECT_ABILITIES } from '../abilities/shield-sect.js';

export class AbilitiesShop extends ItemShop {
  constructor(container, roundNumber = 1) {
    super(container, roundNumber);
    this.shopType = 'abilities';
  }

  generateItemByTier(tier) {
    const tierCosts = { 1: 100, 2: 200, 3: 300 };
    const cost = tierCosts[tier];
    
    const combineAndDeduplicate = (abilities) => {
      const seen = new Set();
      return abilities.filter(ability => {
        if (seen.has(ability.name)) {
          return false;
        }
        seen.add(ability.name);
        return true;
      });
    };

    const abilityTemplates = {
      1: combineAndDeduplicate([
        ...ATTACK_SECT_ABILITIES[1],
        ...EVADE_SECT_ABILITIES[1],
        ...CRIT_SECT_ABILITIES[1],
        ...HEALTH_SECT_ABILITIES[1],
        ...REGEN_SECT_ABILITIES[1],
        ...POISON_SECT_ABILITIES[1],
        ...FROST_SECT_ABILITIES[1],
        ...SHIELD_SECT_ABILITIES[1]
      ]),
      2: combineAndDeduplicate([
        ...ATTACK_SECT_ABILITIES[2],
        ...EVADE_SECT_ABILITIES[2],
        ...CRIT_SECT_ABILITIES[2],
        ...HEALTH_SECT_ABILITIES[2],
        ...REGEN_SECT_ABILITIES[2],
        ...POISON_SECT_ABILITIES[2],
        ...FROST_SECT_ABILITIES[2],
        ...SHIELD_SECT_ABILITIES[2]
      ]),
      3: combineAndDeduplicate([
        ...ATTACK_SECT_ABILITIES[3],
        ...EVADE_SECT_ABILITIES[3],
        ...CRIT_SECT_ABILITIES[3],
        ...HEALTH_SECT_ABILITIES[3],
        ...REGEN_SECT_ABILITIES[3],
        ...POISON_SECT_ABILITIES[3],
        ...FROST_SECT_ABILITIES[3],
        ...SHIELD_SECT_ABILITIES[3]
      ])
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
    } else {
      modifiedHero.purchasedAbilities = [...modifiedHero.purchasedAbilities];
    }
    
    const existingAbilitiesMap = new Map();
    modifiedHero.purchasedAbilities.forEach(ability => {
      const key = `${ability.name}-${ability.effect}`;
      existingAbilitiesMap.set(key, ability);
    });
    
    this.purchasedItems.forEach(newAbility => {
      const key = `${newAbility.name}-${newAbility.effect}`;
      const existing = existingAbilitiesMap.get(key);
      
      const maxStacks = (newAbility.tier === 1 || newAbility.tier === 2) ? 5 : 1;
      
      if (existing) {
        if (existing.stacks < maxStacks) {
          existing.stacks = (existing.stacks || 1) + 1;
          existing.value = existing.baseValue * existing.stacks;
          existing.description = this.getStackedDescription(existing);
        }
      } else {
        const abilityToAdd = {
          ...newAbility,
          stacks: 1,
          maxStacks: maxStacks,
          baseValue: newAbility.value
        };
        modifiedHero.purchasedAbilities.push(abilityToAdd);
        existingAbilitiesMap.set(key, abilityToAdd);
      }
    });

    return modifiedHero;
  }
  
  getStackedDescription(ability) {
    const baseDesc = ability.description.split(' by ')[0];
    return `${baseDesc} by ${ability.value}`;
  }
  
  purchaseItem(slotIndex) {
    const slot = this.itemSlots[slotIndex];
    if (!slot.item) return;
    
    const ability = slot.item;
    const key = `${ability.name}-${ability.effect}`;
    const maxStacks = (ability.tier === 1 || ability.tier === 2) ? 5 : 1;
    
    if (this.player && this.player.hero && this.player.hero.purchasedAbilities) {
      const existing = this.player.hero.purchasedAbilities.find(
        a => `${a.name}-${a.effect}` === key
      );
      
      if (existing) {
        const currentStacks = existing.stacks || 1;
        if (currentStacks >= maxStacks) {
          return;
        }
      }
    }
    
    super.purchaseItem(slotIndex);
  }
  
  renderPurchasedItems() {
    if (!this.player || !this.player.hero || !this.player.hero.purchasedAbilities) {
      return super.renderPurchasedItems();
    }
    
    const abilities = this.player.hero.purchasedAbilities;
    if (abilities.length === 0) {
      return '<p class="no-items">No abilities purchased yet</p>';
    }
    
    return abilities.map(ability => {
      const stackDisplay = ability.stacks > 1 ? ` x${ability.stacks}` : '';
      const totalValue = ability.value;
      const valueDisplay = ability.stacks > 1 ? ` (+${totalValue} total)` : '';
      
      return `
        <div class="purchased-item">
          <span class="item-emoji">${ability.emoji}</span>
          <span class="item-name">${ability.name}${stackDisplay}</span>
          <span class="item-effect">${ability.description}${valueDisplay}</span>
        </div>
      `;
    }).join('');
  }
  
  renderItemSlot(slotIndex) {
    const slot = this.itemSlots[slotIndex];
    
    if (!slot.item) {
      return `
        <div class="item-slot empty">
          <div class="item-placeholder">Sold Out</div>
        </div>
      `;
    }

    const ability = slot.item;
    const key = `${ability.name}-${ability.effect}`;
    const maxStacks = (ability.tier === 1 || ability.tier === 2) ? 5 : 1;
    
    let currentStacks = 0;
    let isMaxed = false;
    
    if (this.player && this.player.hero && this.player.hero.purchasedAbilities) {
      const existing = this.player.hero.purchasedAbilities.find(
        a => `${a.name}-${a.effect}` === key
      );
      if (existing) {
        currentStacks = existing.stacks || 1;
        isMaxed = currentStacks >= maxStacks;
      }
    }
    
    const canAfford = this.playerGold >= ability.cost;
    const canPurchase = canAfford && !isMaxed;
    const tierClass = `tier-${ability.tier}`;
    
    let buttonText = 'Buy';
    if (isMaxed) {
      buttonText = maxStacks === 1 ? 'Owned' : 'Maxed (5/5)';
    } else if (!canAfford) {
      buttonText = 'Too Expensive';
    }
    
    const stackDisplay = currentStacks > 0 ? ` <span class="stack-count">x${currentStacks}</span>` : '';
    const stackInfo = maxStacks > 1 ? ` <span class="stack-info">(${currentStacks}/${maxStacks})</span>` : '';
    
    return `
      <div class="item-slot ${tierClass}">
        <div class="item-tier-badge">T${ability.tier}</div>
        <div class="item-header">
          <span class="item-emoji">${ability.emoji}</span>
          <span class="item-cost">💰${ability.cost}</span>
        </div>
        <div class="item-name">${ability.name}${stackDisplay}</div>
        <div class="item-description">${ability.description}${stackInfo}</div>
        <div class="item-actions">
          <button class="action-button primary purchase-btn" data-slot="${slotIndex}" ${!canPurchase ? 'disabled' : ''}>
            ${buttonText}
          </button>
        </div>
      </div>
    `;
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

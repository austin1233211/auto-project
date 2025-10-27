import { ATTACK_SECT_ABILITIES } from '../abilities/attack-sect.js';
import { EVADE_SECT_ABILITIES } from '../abilities/evade-sect.js';
import { CRIT_SECT_ABILITIES } from '../abilities/crit-sect.js';
import { HEALTH_SECT_ABILITIES } from '../abilities/health-sect.js';
import { REGEN_SECT_ABILITIES } from '../abilities/regen-sect.js';
import { POISON_SECT_ABILITIES } from '../abilities/poison-sect.js';
import { FROST_SECT_ABILITIES } from '../abilities/frost-sect.js';
import { SHIELD_SECT_ABILITIES } from '../abilities/shield-sect.js';

export class Tier3AbilitySelector {
  constructor() {
    this.onAbilitySelected = null;
    this.selectedAbility = null;
  }

  getAllTier3Abilities() {
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

    return combineAndDeduplicate([
      ...ATTACK_SECT_ABILITIES[3],
      ...EVADE_SECT_ABILITIES[3],
      ...CRIT_SECT_ABILITIES[3],
      ...HEALTH_SECT_ABILITIES[3],
      ...REGEN_SECT_ABILITIES[3],
      ...POISON_SECT_ABILITIES[3],
      ...FROST_SECT_ABILITIES[3],
      ...SHIELD_SECT_ABILITIES[3]
    ]);
  }

  selectRandomTier3Abilities(count = 3) {
    const allAbilities = this.getAllTier3Abilities();
    const shuffled = [...allAbilities].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  show(title = 'Choose Tier 3 Ability', subtitle = 'Select one powerful ability') {
    const abilities = this.selectRandomTier3Abilities(3);
    
    const overlay = document.createElement('div');
    overlay.className = 'tier3-selector-overlay';
    overlay.id = 'tier3-selector-overlay';
    overlay.innerHTML = `
      <div class="tier3-selector-modal">
        <div class="tier3-selector-header">
          <h2>${title}</h2>
          <p>${subtitle}</p>
        </div>
        
        <div class="tier3-abilities-grid">
          ${abilities.map((ability, index) => `
            <div class="tier3-ability-option" data-index="${index}">
              <div class="ability-emoji">${ability.emoji}</div>
              <div class="ability-name">${ability.name}</div>
              <div class="ability-description">${ability.description}</div>
              <div class="ability-tier-badge">Tier 3</div>
              <button class="select-tier3-button" data-index="${index}">
                Select
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    overlay.querySelectorAll('.select-tier3-button').forEach((button, index) => {
      button.addEventListener('click', () => {
        this.selectedAbility = abilities[index];
        this.confirmSelection();
      });
    });
    
    overlay.querySelectorAll('.tier3-ability-option').forEach((option) => {
      option.addEventListener('click', (e) => {
        if (!e.target.classList.contains('select-tier3-button')) {
          overlay.querySelectorAll('.tier3-ability-option').forEach(opt => {
            opt.classList.remove('selected');
          });
          option.classList.add('selected');
        }
      });
    });
    
    return abilities;
  }

  confirmSelection() {
    if (this.selectedAbility && this.onAbilitySelected) {
      const abilityWithMetadata = {
        ...this.selectedAbility,
        cost: 0,
        tier: 3,
        tierName: 'Tier 3',
        type: 'ability'
      };
      
      this.onAbilitySelected(abilityWithMetadata);
      this.hide();
    }
  }

  hide() {
    const overlay = document.getElementById('tier3-selector-overlay');
    if (overlay) {
      document.body.removeChild(overlay);
    }
  }

  setOnAbilitySelected(callback) {
    this.onAbilitySelected = callback;
  }
}

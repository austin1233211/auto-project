/**
 * Trigger type constants for ability system.
 * These define when abilities can be triggered during combat.
 */

export const TRIGGER_TYPES = {
  ON_ATTACK: 'on_attack',
  ON_EVADE: 'on_evade',
  ON_CRIT: 'on_crit',
  ON_DAMAGE_TAKEN: 'on_damage_taken',
  ON_ULTIMATE: 'on_ultimate',
  
  STATUS_TICK: 'status_tick',
  ENHANCED_TICK: 'enhanced_tick',
  DRUMS_TICK: 'drums_tick',
  FROST_NOVA_TICK: 'frost_nova_tick',
  SHIELD_LOSS_TICK: 'shield_loss_tick',
  
  BATTLE_START: 'battle_start',
  DEATH_SAVE: 'death_save',
  HIGH_DAMAGE_TAKEN: 'high_damage_taken',
  LOW_HP_CHECK: 'low_hp_check',
  
  ON_HEAL: 'on_heal',
  HEAL_THRESHOLD_CHECK: 'heal_threshold_check'
};

/**
 * Check if a trigger type is valid.
 * @param {string} triggerType - The trigger type to validate
 * @returns {boolean} True if valid
 */
export function isValidTriggerType(triggerType) {
  return Object.values(TRIGGER_TYPES).includes(triggerType);
}

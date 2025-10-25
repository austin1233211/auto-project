/**
 * Registry for all ability effects.
 * Maps effect names to their corresponding effect classes.
 */

import { AbilityCooldownEffect } from './effects/ability-cooldown.js';
import { ArmorBoostEffect } from './effects/armor-boost.js';
import { ArmorPierceChanceEffect } from './effects/armor-pierce-chance.js';
import { AttackBleedEffect } from './effects/attack-bleed.js';
import { AttackBoostEffect } from './effects/attack-boost.js';
import { AttackDamageIncreaseEffect } from './effects/attack-damage-increase.js';
import { AttackFrostChanceEffect } from './effects/attack-frost-chance.js';
import { AttackFrostEffect } from './effects/attack-frost.js';
import { AttackHealChanceEffect } from './effects/attack-heal-chance.js';
import { AttackHealEffect } from './effects/attack-heal.js';
import { AttackManaRestoreEffect } from './effects/attack-mana-restore.js';
import { AttackManaEffect } from './effects/attack-mana.js';
import { AttackPoisonChanceEffect } from './effects/attack-poison-chance.js';
import { AttackPoisonEffect } from './effects/attack-poison.js';
import { AttackShieldChanceEffect } from './effects/attack-shield-chance.js';
import { AttackShieldEffect } from './effects/attack-shield.js';
import { AttackSpeedBoostEffect } from './effects/attack-speed-boost.js';
import { AttackSpeedIncreaseEffect } from './effects/attack-speed-increase.js';
import { AttackSpeedEffect } from './effects/attack-speed.js';
import { AuraHealNearbyEffect } from './effects/aura-heal-nearby.js';
import { BaseCritBoostEffect } from './effects/base-crit-boost.js';
import { BaseDamageBoostEffect } from './effects/base-damage-boost.js';
import { BaseEvasionBoostEffect } from './effects/base-evasion-boost.js';
import { BattleFuryEffect } from './effects/battle-fury.js';
import { BattleStartEvasionEffect } from './effects/battle-start-evasion.js';
import { BattleStartFrostEffect } from './effects/battle-start-frost.js';
import { BattleStartPoisonEffect } from './effects/battle-start-poison.js';
import { BattleStartShieldEffect } from './effects/battle-start-shield.js';
import { BattleTranceEffect } from './effects/battle-trance.js';
import { BerserkerFocusEffect } from './effects/berserker-focus.js';
import { BladeDanceEffect } from './effects/blade-dance.js';
import { BleedingChanceEffect } from './effects/bleeding-chance.js';
import { BlockChanceEffect } from './effects/block-chance.js';
import { BloodStrikeEffect } from './effects/blood-strike.js';
import { ColdEmbraceDefenseEffect } from './effects/cold-embrace-defense.js';
import { ConsecutiveAttackBoostEffect } from './effects/consecutive-attack-boost.js';
import { CounterAttackEffect } from './effects/counter-attack.js';
import { CounterChanceEffect } from './effects/counter-chance.js';
import { CoupDeGraceEffect } from './effects/coup-de-grace.js';
import { CritArmorPierceEffect } from './effects/crit-armor-pierce.js';
import { CritAttackBoostEffect } from './effects/crit-attack-boost.js';
import { CritBattleStartEffect } from './effects/crit-battle-start.js';
import { CritBonusDamageEffect } from './effects/crit-bonus-damage.js';
import { CritChainBonusEffect } from './effects/crit-chain-bonus.js';
import { CritChanceBoostEffect } from './effects/crit-chance-boost.js';
import { CritChanceEffect } from './effects/crit-chance.js';
import { CritFrostEffect } from './effects/crit-frost.js';
import { CritGoldBonusEffect } from './effects/crit-gold-bonus.js';
import { CritHealEffect } from './effects/crit-heal.js';
import { CritHpBoostEffect } from './effects/crit-hp-boost.js';
import { CritIgnoreShieldEffect } from './effects/crit-ignore-shield.js';
import { CritLifestealEffect } from './effects/crit-lifesteal.js';
import { CritManaEffect } from './effects/crit-mana.js';
import { CritMultiplierEffect } from './effects/crit-multiplier.js';
import { CritPoisonChanceEffect } from './effects/crit-poison-chance.js';
import { CritPoisonEffect } from './effects/crit-poison.js';
import { CritResistanceEffect } from './effects/crit-resistance.js';
import { CritShieldEffect } from './effects/crit-shield.js';
import { CritTempHpEffect } from './effects/crit-temp-hp.js';
import { CrushingBlowEffect } from './effects/crushing-blow.js';
import { DamageBlockChanceEffect } from './effects/damage-block-chance.js';
import { DamageCounterEffect } from './effects/damage-counter.js';
import { DamageFrostChanceEffect } from './effects/damage-frost-chance.js';
import { DamageImmunityEffect } from './effects/damage-immunity.js';
import { DamagePoisonChanceEffect } from './effects/damage-poison-chance.js';
import { DamagePoisonReflectEffect } from './effects/damage-poison-reflect.js';
import { DamageReductionEffect } from './effects/damage-reduction.js';
import { DamageToHealEffect } from './effects/damage-to-heal.js';
import { DealDamagePoisonChanceEffect } from './effects/deal-damage-poison-chance.js';
import { DeathImmunityShieldEffect } from './effects/death-immunity-shield.js';
import { DeathReviveEffect } from './effects/death-revive.js';
import { DeathSaveEffect } from './effects/death-save.js';
import { DispersionEffect } from './effects/dispersion.js';
import { DoubleAttackChanceEffect } from './effects/double-attack-chance.js';
import { DrumsOfSlomEffect } from './effects/drums-of-slom.js';
import { EnhancedRegenEffect } from './effects/enhanced-regen.js';
import { EvadeCounterEffect } from './effects/evade-counter.js';
import { EvadeCritBoostEffect } from './effects/evade-crit-boost.js';
import { EvadeCritDamageEffect } from './effects/evade-crit-damage.js';
import { EvadeDamageReflectEffect } from './effects/evade-damage-reflect.js';
import { EvadeFrostEffect } from './effects/evade-frost.js';
import { EvadeHealEffect } from './effects/evade-heal.js';
import { EvadeManaEffect } from './effects/evade-mana.js';
import { EvadePoisonEffect } from './effects/evade-poison.js';
import { EvadeReflectEffect } from './effects/evade-reflect.js';
import { EvadeShieldEffect } from './effects/evade-shield.js';
import { EvasionAttackBonusEffect } from './effects/evasion-attack-bonus.js';
import { EvasionAttackDamageEffect } from './effects/evasion-attack-damage.js';
import { EvasionBoostEffect } from './effects/evasion-boost.js';
import { EvasionChanceEffect } from './effects/evasion-chance.js';
import { EvasionDamageReductionEffect } from './effects/evasion-damage-reduction.js';
import { FrostAuraEffect } from './effects/frost-aura.js';
import { FrostDamageChanceEffect } from './effects/frost-damage-chance.js';
import { FrostDamageReductionEffect } from './effects/frost-damage-reduction.js';
import { FrostManaBoostEffect } from './effects/frost-mana-boost.js';
import { FrostNovaDamageEffect } from './effects/frost-nova-damage.js';
import { FrostPoisonChanceEffect } from './effects/frost-poison-chance.js';
import { FrostResistanceEffect } from './effects/frost-resistance.js';
import { FrostSlowAuraEffect } from './effects/frost-slow-aura.js';
import { FrostStackBonusEffect } from './effects/frost-stack-bonus.js';
import { FrostbiteStunEffect } from './effects/frostbite-stun.js';
import { GoldBonusEffect } from './effects/gold-bonus.js';
import { GreaterBashEffect } from './effects/greater-bash.js';
import { HealDamageChanceEffect } from './effects/heal-damage-chance.js';
import { HealFrostChanceEffect } from './effects/heal-frost-chance.js';
import { HealPoisonChanceEffect } from './effects/heal-poison-chance.js';
import { HealShieldChanceEffect } from './effects/heal-shield-chance.js';
import { HealThresholdDamageEffect } from './effects/heal-threshold-damage.js';
import { HealToAttackBoostEffect } from './effects/heal-to-attack-boost.js';
import { HealToDamageAuraEffect } from './effects/heal-to-damage-aura.js';
import { HealthArmorBonusEffect } from './effects/health-armor-bonus.js';
import { HealthBoostFlatEffect } from './effects/health-boost-flat.js';
import { HealthBoostEffect } from './effects/health-boost.js';
import { HealthDeathImmunityEffect } from './effects/health-death-immunity.js';
import { HealthOnCritEffect } from './effects/health-on-crit.js';
import { HealthOnKillEffect } from './effects/health-on-kill.js';
import { HealthPercentageBoostMajorEffect } from './effects/health-percentage-boost-major.js';
import { HealthPercentageBoostEffect } from './effects/health-percentage-boost.js';
import { HealthRegenFlatEffect } from './effects/health-regen-flat.js';
import { HealthRegenPercentEffect } from './effects/health-regen-percent.js';
import { HealthSectReductionEffect } from './effects/health-sect-reduction.js';
import { HealthStatusResistEffect } from './effects/health-status-resist.js';
import { HighDamageShieldEffect } from './effects/high-damage-shield.js';
import { HolyReflectionEffect } from './effects/holy-reflection.js';
import { HpDamageAuraEffect } from './effects/hp-damage-aura.js';
import { HpLossDamageReductionEffect } from './effects/hp-loss-damage-reduction.js';
import { HpLossFrostEffect } from './effects/hp-loss-frost.js';
import { HpLossPoisonEffect } from './effects/hp-loss-poison.js';
import { HpLossShieldEffect } from './effects/hp-loss-shield.js';
import { HpSacrificeDamageEffect } from './effects/hp-sacrifice-damage.js';
import { IgnoreEnemyEvadeEffect } from './effects/ignore-enemy-evade.js';
import { IgnoreEvadeEffect } from './effects/ignore-evade.js';
import { KillAttackBoostEffect } from './effects/kill-attack-boost.js';
import { LifeBreakEffect } from './effects/life-break.js';
import { LowHealthDamageEffect } from './effects/low-health-damage.js';
import { LowHealthLifestealEffect } from './effects/low-health-lifesteal.js';
import { LowHealthRegenEffect } from './effects/low-health-regen.js';
import { LowHpHealDoubleEffect } from './effects/low-hp-heal-double.js';
import { LowHpPoisonBurstEffect } from './effects/low-hp-poison-burst.js';
import { LowHpRegenBoostEffect } from './effects/low-hp-regen-boost.js';
import { MagicAmpEffect } from './effects/magic-amp.js';
import { MagicCritChanceEffect } from './effects/magic-crit-chance.js';
import { MagicCritEffect } from './effects/magic-crit.js';
import { MagicEvadeEffect } from './effects/magic-evade.js';
import { MagicEvasionEffect } from './effects/magic-evasion.js';
import { MagicResistEffect } from './effects/magic-resist.js';
import { ManaRegenEffect } from './effects/mana-regen.js';
import { ManaToHealEffect } from './effects/mana-to-heal.js';
import { MischiefEffect } from './effects/mischief.js';
import { OpponentCritResistEffect } from './effects/opponent-crit-resist.js';
import { OpponentHealResistEffect } from './effects/opponent-heal-resist.js';
import { OpponentHealthReductionEffect } from './effects/opponent-health-reduction.js';
import { PhysicalAmpEffect } from './effects/physical-amp.js';
import { PoisonAuraEffect } from './effects/poison-aura.js';
import { PoisonDamageBoostEffect } from './effects/poison-damage-boost.js';
import { PoisonDecayResistEffect } from './effects/poison-decay-resist.js';
import { PoisonHealConversionEffect } from './effects/poison-heal-conversion.js';
import { PoisonOnEvadeEffect } from './effects/poison-on-evade.js';
import { PoisonResistanceEffect } from './effects/poison-resistance.js';
import { PoisonSpreadChanceEffect } from './effects/poison-spread-chance.js';
import { PoisonStackBonusEffect } from './effects/poison-stack-bonus.js';
import { PoisonStatusImmunityEffect } from './effects/poison-status-immunity.js';
import { PressAttackEffect } from './effects/press-attack.js';
import { RelentlessStrikeEffect } from './effects/relentless-strike.js';
import { SelfPoisonReflectEffect } from './effects/self-poison-reflect.js';
import { ShieldAuraEffect } from './effects/shield-aura.js';
import { ShieldDamageBonusEffect } from './effects/shield-damage-bonus.js';
import { ShieldDamageChanceEffect } from './effects/shield-damage-chance.js';
import { ShieldEffectivenessEffect } from './effects/shield-effectiveness.js';
import { ShieldFrostChanceEffect } from './effects/shield-frost-chance.js';
import { ShieldLossDamageEffect } from './effects/shield-loss-damage.js';
import { ShieldPoisonChanceEffect } from './effects/shield-poison-chance.js';
import { ShieldReflectChanceEffect } from './effects/shield-reflect-chance.js';
import { ShieldRegenEffect } from './effects/shield-regen.js';
import { ShieldResistanceEffect } from './effects/shield-resistance.js';
import { SourceDetonationEffect } from './effects/source-detonation.js';
import { SpeedBoostEffect } from './effects/speed-boost.js';
import { StackingAttackBoostEffect } from './effects/stacking-attack-boost.js';
import { StackingAttackSpeedEffect } from './effects/stacking-attack-speed.js';
import { StatBoostEffect } from './effects/stat-boost.js';
import { StatusShieldCleanseEffect } from './effects/status-shield-cleanse.js';
import { UltimateFrostEffect } from './effects/ultimate-frost.js';
import { UltimateHealEffect } from './effects/ultimate-heal.js';
import { UltimatePoisonEffect } from './effects/ultimate-poison.js';
import { UltimatePowerEffect } from './effects/ultimate-power.js';
import { UltimateShieldEffect } from './effects/ultimate-shield.js';
import { UnyieldingSpiritEffect } from './effects/unyielding-spirit.js';
import { VendettaEffect } from './effects/vendetta.js';
import { WeaponMasteryEffect } from './effects/weapon-mastery.js';
import { WindrunEffect } from './effects/windrun.js';

/**
 * Registry mapping effect names to their effect classes.
 */
export const EffectRegistry = {
  'ability_cooldown': AbilityCooldownEffect,
  'armor_boost': ArmorBoostEffect,
  'armor_pierce_chance': ArmorPierceChanceEffect,
  'attack_bleed': AttackBleedEffect,
  'attack_boost': AttackBoostEffect,
  'attack_damage_increase': AttackDamageIncreaseEffect,
  'attack_frost_chance': AttackFrostChanceEffect,
  'attack_frost': AttackFrostEffect,
  'attack_heal_chance': AttackHealChanceEffect,
  'attack_heal': AttackHealEffect,
  'attack_mana_restore': AttackManaRestoreEffect,
  'attack_mana': AttackManaEffect,
  'attack_poison_chance': AttackPoisonChanceEffect,
  'attack_poison': AttackPoisonEffect,
  'attack_shield_chance': AttackShieldChanceEffect,
  'attack_shield': AttackShieldEffect,
  'attack_speed_boost': AttackSpeedBoostEffect,
  'attack_speed_increase': AttackSpeedIncreaseEffect,
  'attack_speed': AttackSpeedEffect,
  'aura_heal_nearby': AuraHealNearbyEffect,
  'base_crit_boost': BaseCritBoostEffect,
  'base_damage_boost': BaseDamageBoostEffect,
  'base_evasion_boost': BaseEvasionBoostEffect,
  'battle_fury': BattleFuryEffect,
  'battle_start_evasion': BattleStartEvasionEffect,
  'battle_start_frost': BattleStartFrostEffect,
  'battle_start_poison': BattleStartPoisonEffect,
  'battle_start_shield': BattleStartShieldEffect,
  'battle_trance': BattleTranceEffect,
  'berserker_focus': BerserkerFocusEffect,
  'blade_dance': BladeDanceEffect,
  'bleeding_chance': BleedingChanceEffect,
  'block_chance': BlockChanceEffect,
  'blood_strike': BloodStrikeEffect,
  'cold_embrace_defense': ColdEmbraceDefenseEffect,
  'consecutive_attack_boost': ConsecutiveAttackBoostEffect,
  'counter_attack': CounterAttackEffect,
  'counter_chance': CounterChanceEffect,
  'coup_de_grace': CoupDeGraceEffect,
  'crit_armor_pierce': CritArmorPierceEffect,
  'crit_attack_boost': CritAttackBoostEffect,
  'crit_battle_start': CritBattleStartEffect,
  'crit_bonus_damage': CritBonusDamageEffect,
  'crit_chain_bonus': CritChainBonusEffect,
  'crit_chance_boost': CritChanceBoostEffect,
  'crit_chance': CritChanceEffect,
  'crit_frost': CritFrostEffect,
  'crit_gold_bonus': CritGoldBonusEffect,
  'crit_heal': CritHealEffect,
  'crit_hp_boost': CritHpBoostEffect,
  'crit_ignore_shield': CritIgnoreShieldEffect,
  'crit_lifesteal': CritLifestealEffect,
  'crit_mana': CritManaEffect,
  'crit_multiplier': CritMultiplierEffect,
  'crit_poison_chance': CritPoisonChanceEffect,
  'crit_poison': CritPoisonEffect,
  'crit_resistance': CritResistanceEffect,
  'crit_shield': CritShieldEffect,
  'crit_temp_hp': CritTempHpEffect,
  'crushing_blow': CrushingBlowEffect,
  'damage_block_chance': DamageBlockChanceEffect,
  'damage_counter': DamageCounterEffect,
  'damage_frost_chance': DamageFrostChanceEffect,
  'damage_immunity': DamageImmunityEffect,
  'damage_poison_chance': DamagePoisonChanceEffect,
  'damage_poison_reflect': DamagePoisonReflectEffect,
  'damage_reduction': DamageReductionEffect,
  'damage_to_heal': DamageToHealEffect,
  'deal_damage_poison_chance': DealDamagePoisonChanceEffect,
  'death_immunity_shield': DeathImmunityShieldEffect,
  'death_revive': DeathReviveEffect,
  'death_save': DeathSaveEffect,
  'dispersion': DispersionEffect,
  'double_attack_chance': DoubleAttackChanceEffect,
  'drums_of_slom': DrumsOfSlomEffect,
  'enhanced_regen': EnhancedRegenEffect,
  'evade_counter': EvadeCounterEffect,
  'evade_crit_boost': EvadeCritBoostEffect,
  'evade_crit_damage': EvadeCritDamageEffect,
  'evade_damage_reflect': EvadeDamageReflectEffect,
  'evade_frost': EvadeFrostEffect,
  'evade_heal': EvadeHealEffect,
  'evade_mana': EvadeManaEffect,
  'evade_poison': EvadePoisonEffect,
  'evade_reflect': EvadeReflectEffect,
  'evade_shield': EvadeShieldEffect,
  'evasion_attack_bonus': EvasionAttackBonusEffect,
  'evasion_attack_damage': EvasionAttackDamageEffect,
  'evasion_boost': EvasionBoostEffect,
  'evasion_chance': EvasionChanceEffect,
  'evasion_damage_reduction': EvasionDamageReductionEffect,
  'frost_aura': FrostAuraEffect,
  'frost_damage_chance': FrostDamageChanceEffect,
  'frost_damage_reduction': FrostDamageReductionEffect,
  'frost_mana_boost': FrostManaBoostEffect,
  'frost_nova_damage': FrostNovaDamageEffect,
  'frost_poison_chance': FrostPoisonChanceEffect,
  'frost_resistance': FrostResistanceEffect,
  'frost_slow_aura': FrostSlowAuraEffect,
  'frost_stack_bonus': FrostStackBonusEffect,
  'frostbite_stun': FrostbiteStunEffect,
  'gold_bonus': GoldBonusEffect,
  'greater_bash': GreaterBashEffect,
  'heal_damage_chance': HealDamageChanceEffect,
  'heal_frost_chance': HealFrostChanceEffect,
  'heal_poison_chance': HealPoisonChanceEffect,
  'heal_shield_chance': HealShieldChanceEffect,
  'heal_threshold_damage': HealThresholdDamageEffect,
  'heal_to_attack_boost': HealToAttackBoostEffect,
  'heal_to_damage_aura': HealToDamageAuraEffect,
  'health_armor_bonus': HealthArmorBonusEffect,
  'health_boost_flat': HealthBoostFlatEffect,
  'health_boost': HealthBoostEffect,
  'health_death_immunity': HealthDeathImmunityEffect,
  'health_on_crit': HealthOnCritEffect,
  'health_on_kill': HealthOnKillEffect,
  'health_percentage_boost_major': HealthPercentageBoostMajorEffect,
  'health_percentage_boost': HealthPercentageBoostEffect,
  'health_regen_flat': HealthRegenFlatEffect,
  'health_regen_percent': HealthRegenPercentEffect,
  'health_sect_reduction': HealthSectReductionEffect,
  'health_status_resist': HealthStatusResistEffect,
  'high_damage_shield': HighDamageShieldEffect,
  'holy_reflection': HolyReflectionEffect,
  'hp_damage_aura': HpDamageAuraEffect,
  'hp_loss_damage_reduction': HpLossDamageReductionEffect,
  'hp_loss_frost': HpLossFrostEffect,
  'hp_loss_poison': HpLossPoisonEffect,
  'hp_loss_shield': HpLossShieldEffect,
  'hp_sacrifice_damage': HpSacrificeDamageEffect,
  'ignore_enemy_evade': IgnoreEnemyEvadeEffect,
  'ignore_evade': IgnoreEvadeEffect,
  'kill_attack_boost': KillAttackBoostEffect,
  'life_break': LifeBreakEffect,
  'low_health_damage': LowHealthDamageEffect,
  'low_health_lifesteal': LowHealthLifestealEffect,
  'low_health_regen': LowHealthRegenEffect,
  'low_hp_heal_double': LowHpHealDoubleEffect,
  'low_hp_poison_burst': LowHpPoisonBurstEffect,
  'low_hp_regen_boost': LowHpRegenBoostEffect,
  'magic_amp': MagicAmpEffect,
  'magic_crit_chance': MagicCritChanceEffect,
  'magic_crit': MagicCritEffect,
  'magic_evade': MagicEvadeEffect,
  'magic_evasion': MagicEvasionEffect,
  'magic_resist': MagicResistEffect,
  'mana_regen': ManaRegenEffect,
  'mana_to_heal': ManaToHealEffect,
  'mischief': MischiefEffect,
  'opponent_crit_resist': OpponentCritResistEffect,
  'opponent_heal_resist': OpponentHealResistEffect,
  'opponent_health_reduction': OpponentHealthReductionEffect,
  'physical_amp': PhysicalAmpEffect,
  'poison_aura': PoisonAuraEffect,
  'poison_damage_boost': PoisonDamageBoostEffect,
  'poison_decay_resist': PoisonDecayResistEffect,
  'poison_heal_conversion': PoisonHealConversionEffect,
  'poison_on_evade': PoisonOnEvadeEffect,
  'poison_resistance': PoisonResistanceEffect,
  'poison_spread_chance': PoisonSpreadChanceEffect,
  'poison_stack_bonus': PoisonStackBonusEffect,
  'poison_status_immunity': PoisonStatusImmunityEffect,
  'press_attack': PressAttackEffect,
  'relentless_strike': RelentlessStrikeEffect,
  'self_poison_reflect': SelfPoisonReflectEffect,
  'shield_aura': ShieldAuraEffect,
  'shield_damage_bonus': ShieldDamageBonusEffect,
  'shield_damage_chance': ShieldDamageChanceEffect,
  'shield_effectiveness': ShieldEffectivenessEffect,
  'shield_frost_chance': ShieldFrostChanceEffect,
  'shield_loss_damage': ShieldLossDamageEffect,
  'shield_poison_chance': ShieldPoisonChanceEffect,
  'shield_reflect_chance': ShieldReflectChanceEffect,
  'shield_regen': ShieldRegenEffect,
  'shield_resistance': ShieldResistanceEffect,
  'source_detonation': SourceDetonationEffect,
  'speed_boost': SpeedBoostEffect,
  'stacking_attack_boost': StackingAttackBoostEffect,
  'stacking_attack_speed': StackingAttackSpeedEffect,
  'stat_boost': StatBoostEffect,
  'status_shield_cleanse': StatusShieldCleanseEffect,
  'ultimate_frost': UltimateFrostEffect,
  'ultimate_heal': UltimateHealEffect,
  'ultimate_poison': UltimatePoisonEffect,
  'ultimate_power': UltimatePowerEffect,
  'ultimate_shield': UltimateShieldEffect,
  'unyielding_spirit': UnyieldingSpiritEffect,
  'vendetta': VendettaEffect,
  'weapon_mastery': WeaponMasteryEffect,
  'windrun': WindrunEffect,
};

/**
 * Creates an effect instance from an ability object.
 * @param {Object} ability - Ability with effect and value properties
 * @returns {BaseEffect} Effect instance
 */
export function createEffect(ability) {
  const EffectClass = EffectRegistry[ability.effect];
  
  if (!EffectClass) {
    console.warn(`Unknown effect type: ${ability.effect}`);
    return null;
  }
  
  return new EffectClass(ability.value);
}

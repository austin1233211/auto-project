/**
 * Game Constants
 * Central location for all magic numbers and configuration values
 */

export const TIMER_CONSTANTS = {
  BUFFER_PHASE_DURATION: 30,
  ROUND_PHASE_DURATION: 50,
  DAMAGE_ESCALATION_START: 20,
  DAMAGE_ESCALATION_RATE: 0.06,
  BATTLE_END_DELAY: 3000, // milliseconds
};

export const PLAYER_CONSTANTS = {
  STARTING_GOLD: 300,
  STARTING_HEALTH: 100,
  MAX_PLAYERS_TOURNAMENT: 8,
};

export const COMBAT_CONSTANTS = {
  HIGH_DAMAGE_THRESHOLD: 80,
  MANA_REGEN_INTERVAL: 100, // milliseconds
  STATUS_EFFECT_INTERVAL: 1000, // milliseconds
  HEALTH_UPDATE_THROTTLE: 50, // milliseconds
  MANA_UPDATE_THROTTLE: 50, // milliseconds
};

export const ROUND_CONSTANTS = {
  MINION_ROUNDS: [5, 10, 15, 20],
  ARTIFACT_ROUNDS: [3, 8, 13],
};

export const RATE_LIMIT_CONSTANTS = {
  DEFAULT_WINDOW: 1000, // milliseconds
  DEFAULT_MAX_REQUESTS: 5,
};

export const SESSION_CONSTANTS = {
  RECONNECTION_WINDOW: 30000, // milliseconds (30 seconds)
  SESSION_CLEANUP_INTERVAL: 60000, // milliseconds (1 minute)
};

export const SERVER_CONSTANTS = {
  SUSPICIOUS_RESULTS_THRESHOLD: 3,
  PORT: 3001,
};

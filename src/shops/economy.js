/**
 * @typedef {Object} Player
 * @property {number} gold
 * @property {number} consecutiveWins
 * @property {number} consecutiveLosses
 * @property {number} roundsPlayed
 */

/**
 * @typedef {Object} BattleResult
 * @property {boolean} isVictory
 * @property {number} hpLost
 */

/**
 * @typedef {Object} IncomeBreakdown
 * @property {number} baseIncome
 * @property {number} battleReward
 * @property {number} streakBonus
 * @property {number} interest
 * @property {number} total
 */

/**
 * @typedef {Object} MoneyAwardResult
 * @property {number} reward
 * @property {number} totalMoney
 * @property {number} winStreak
 * @property {number} lossStreak
 * @property {IncomeBreakdown} breakdown
 */

/**
 * @typedef {Object} TierProbabilities
 * @property {number} tier1
 * @property {number} tier2
 * @property {number} tier3
 */

/**
 * Economy system for managing gold, rewards, and item tier generation
 */
export class Economy {
  constructor() {
    this.startingGold = 300;
    this.baseIncomePerRound = 250;
    this.winBaseReward = 50;
    this.winStreakBonus = 25;
    this.maxWinStreakBonus = 150;
    this.lossHpReward = 20;
    this.lossStreakBonus = 20;
    this.maxLossStreakBonus = 150;
    this.interestRate = 0.1;
    this.interestThreshold = 100;
    this.maxInterest = 100;
  }

  /**
   * Initialize a player's economy-related properties
   * @param {Player} player - The player object
   * @returns {Player} The initialized player
   */
  initializePlayer(player) {
    player.gold = this.startingGold;
    player.consecutiveWins = 0;
    player.consecutiveLosses = 0;
    player.roundsPlayed = 0;
    return player;
  }

  /**
   * Calculate income for a round including base income, battle rewards, streaks, and interest
   * @param {Player} player - The player object
   * @param {BattleResult|null} battleResult - Result of the battle (null for no battle)
   * @param {number} goldBonus - Gold bonus multiplier (0-1 range)
   * @returns {IncomeBreakdown} Breakdown of income sources
   */
  calculateRoundIncome(player, battleResult = null, goldBonus = 0) {
    let totalIncome = this.baseIncomePerRound;
    let breakdown = {
      baseIncome: this.baseIncomePerRound,
      battleReward: 0,
      streakBonus: 0,
      interest: 0,
      total: 0
    };

    if (battleResult) {
      if (battleResult.isVictory) {
        let baseReward = this.winBaseReward;
        if (goldBonus > 0) {
          baseReward = Math.round(baseReward * (1 + goldBonus));
        }
        breakdown.battleReward = baseReward;
        const streakBonus = Math.min(player.consecutiveWins * this.winStreakBonus, this.maxWinStreakBonus);
        breakdown.streakBonus = streakBonus;
        totalIncome += breakdown.battleReward + streakBonus;
      } else {
        const hpLostReward = battleResult.hpLost * this.lossHpReward;
        const streakBonus = Math.min(player.consecutiveLosses * this.lossStreakBonus, this.maxLossStreakBonus);
        breakdown.battleReward = hpLostReward;
        breakdown.streakBonus = streakBonus;
        totalIncome += hpLostReward + streakBonus;
      }
    }

    const interestEligibleGold = Math.floor(player.gold / this.interestThreshold) * this.interestThreshold;
    const interest = Math.min(Math.floor(player.gold / this.interestThreshold) * 10, this.maxInterest);
    breakdown.interest = interest;
    totalIncome += interest;

    breakdown.total = totalIncome;
    return breakdown;
  }

  /**
   * Award money to a player after a battle and update win/loss streaks
   * @param {Player} player - The player object
   * @param {boolean} isVictory - Whether the player won the battle
   * @param {number} hpLost - HP lost in the battle (for loss rewards)
   * @param {number} goldBonus - Gold bonus multiplier (0-1 range)
   * @returns {MoneyAwardResult} Result containing reward amount and updated stats
   */
  awardMoney(player, isVictory, hpLost = 0, goldBonus = 0) {
    if (!player.gold) {
      player.gold = this.startingGold;
    }

    const battleResult = {
      isVictory: isVictory,
      hpLost: hpLost
    };

    if (isVictory) {
      player.consecutiveWins = (player.consecutiveWins || 0) + 1;
      player.consecutiveLosses = 0;
    } else {
      player.consecutiveLosses = (player.consecutiveLosses || 0) + 1;
      player.consecutiveWins = 0;
    }

    const income = this.calculateRoundIncome(player, battleResult, goldBonus);
    player.gold += income.total;
    player.roundsPlayed = (player.roundsPlayed || 0) + 1;

    return {
      reward: income.total,
      totalMoney: player.gold,
      winStreak: player.consecutiveWins,
      lossStreak: player.consecutiveLosses,
      breakdown: income
    };
  }

  /**
   * Check if a player can afford a purchase
   * @param {Player} player - The player object
   * @param {number} cost - The cost of the purchase
   * @returns {boolean} True if player can afford it
   */
  canAfford(player, cost) {
    return (player.gold || 0) >= cost;
  }

  /**
   * Spend money from a player's gold
   * @param {Player} player - The player object
   * @param {number} cost - The amount to spend
   * @returns {boolean} True if purchase was successful
   */
  spendMoney(player, cost) {
    if (this.canAfford(player, cost)) {
      player.gold -= cost;
      return true;
    }
    return false;
  }

  /**
   * Get a player's current gold amount
   * @param {Player} player - The player object
   * @returns {number} The player's gold
   */
  getPlayerMoney(player) {
    return player.gold || this.startingGold;
  }

  /**
   * Get tier probabilities based on round number
   * @param {number} roundNumber - The current round number
   * @returns {TierProbabilities} Probabilities for each tier
   */
  getTierProbabilities(roundNumber) {
    const baseRound = Math.max(1, roundNumber);
    
    let tier1Prob = Math.max(0.1, 0.7 - (baseRound - 1) * 0.1);
    let tier3Prob = Math.min(0.6, (baseRound - 1) * 0.15);
    let tier2Prob = 1 - tier1Prob - tier3Prob;

    tier1Prob = Math.max(0.1, tier1Prob);
    tier3Prob = Math.max(0.1, tier3Prob);
    tier2Prob = Math.max(0.1, 1 - tier1Prob - tier3Prob);

    const total = tier1Prob + tier2Prob + tier3Prob;
    return {
      tier1: tier1Prob / total,
      tier2: tier2Prob / total,
      tier3: tier3Prob / total
    };
  }

  /**
   * Generate a random item tier based on round number
   * @param {number} roundNumber - The current round number
   * @returns {number} The generated tier (1, 2, or 3)
   */
  generateItemTier(roundNumber) {
    const probabilities = this.getTierProbabilities(roundNumber);
    const random = Math.random();
    
    if (random < probabilities.tier1) {
      return 1;
    } else if (random < probabilities.tier1 + probabilities.tier2) {
      return 2;
    } else {
      return 3;
    }
  }
}

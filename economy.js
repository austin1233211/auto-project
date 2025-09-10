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

  initializePlayer(player) {
    player.gold = this.startingGold;
    player.consecutiveWins = 0;
    player.consecutiveLosses = 0;
    player.roundsPlayed = 0;
    return player;
  }

  calculateRoundIncome(player, battleResult = null) {
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
        breakdown.battleReward = this.winBaseReward;
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
    const interest = Math.min(interestEligibleGold * this.interestRate / this.interestThreshold * 10, this.maxInterest);
    breakdown.interest = interest;
    totalIncome += interest;

    breakdown.total = totalIncome;
    return breakdown;
  }

  awardMoney(player, isVictory, hpLost = 0) {
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

    const income = this.calculateRoundIncome(player, battleResult);
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

  canAfford(player, cost) {
    return (player.gold || 0) >= cost;
  }

  spendMoney(player, cost) {
    if (this.canAfford(player, cost)) {
      player.gold -= cost;
      return true;
    }
    return false;
  }

  getPlayerMoney(player) {
    return player.gold || this.startingGold;
  }

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

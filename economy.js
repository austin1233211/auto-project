export class Economy {
  constructor() {
    this.baseReward = 10;
    this.winStreakBonus = 5;
    this.lossStreakBonus = 3;
  }

  calculateRoundReward(player) {
    let reward = this.baseReward;
    
    if (player.consecutiveWins >= 2) {
      reward += this.winStreakBonus * Math.min(player.consecutiveWins - 1, 5);
    }
    
    if (player.consecutiveLosses >= 2) {
      reward += this.lossStreakBonus * Math.min(player.consecutiveLosses - 1, 3);
    }
    
    return reward;
  }

  awardMoney(player, isVictory) {
    if (!player.money) {
      player.money = 0;
    }
    
    if (isVictory) {
      player.consecutiveWins = (player.consecutiveWins || 0) + 1;
      player.consecutiveLosses = 0;
    } else {
      player.consecutiveLosses = (player.consecutiveLosses || 0) + 1;
      player.consecutiveWins = 0;
    }
    
    const reward = this.calculateRoundReward(player);
    player.money += reward;
    
    return {
      reward,
      totalMoney: player.money,
      winStreak: player.consecutiveWins,
      lossStreak: player.consecutiveLosses
    };
  }

  canAfford(player, cost) {
    return (player.money || 0) >= cost;
  }

  spendMoney(player, cost) {
    if (this.canAfford(player, cost)) {
      player.money -= cost;
      return true;
    }
    return false;
  }

  getPlayerMoney(player) {
    return player.money || 0;
  }
}

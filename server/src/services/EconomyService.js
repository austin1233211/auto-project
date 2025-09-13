const Ability = require('../models/Ability');

class EconomyService {
  static getTierProbabilities(round) {
    const probabilities = {
      1: { tier1: 100, tier2: 0, tier3: 0 },
      2: { tier1: 75, tier2: 25, tier3: 0 },
      3: { tier1: 55, tier2: 35, tier3: 10 },
      4: { tier1: 45, tier2: 35, tier3: 20 },
      5: { tier1: 30, tier2: 40, tier3: 30 },
      6: { tier1: 25, tier2: 35, tier3: 40 },
      7: { tier1: 20, tier2: 30, tier3: 50 },
      8: { tier1: 15, tier2: 25, tier3: 60 }
    };
    
    return probabilities[Math.min(round, 8)] || probabilities[8];
  }
  
  static async generateShopItems(tierProbabilities, itemCount = 5) {
    const shopItems = [];
    
    for (let i = 0; i < itemCount; i++) {
      const tier = this.selectTierByProbability(tierProbabilities);
      const tierAbilities = await Ability.findByTier(tier);
      
      if (tierAbilities.length > 0) {
        const randomAbility = tierAbilities[Math.floor(Math.random() * tierAbilities.length)];
        shopItems.push(randomAbility);
      }
    }
    
    return shopItems;
  }
  
  static selectTierByProbability(probabilities) {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const [tier, probability] of Object.entries(probabilities)) {
      cumulative += probability;
      if (random <= cumulative) {
        return parseInt(tier.replace('tier', ''));
      }
    }
    
    return 1;
  }
  
  static calculateRoundIncome(wins, losses, streak) {
    let baseIncome = 50;
    
    if (wins > losses) {
      baseIncome += Math.min(streak * 10, 30);
    } else if (losses > wins) {
      baseIncome += Math.min(streak * 15, 50);
    }
    
    const interestRate = 0.1;
    const maxInterest = 50;
    
    return {
      baseIncome,
      interest: Math.min(Math.floor(baseIncome * interestRate), maxInterest),
      total: baseIncome + Math.min(Math.floor(baseIncome * interestRate), maxInterest)
    };
  }
  
  static calculateBattleReward(isWin, streak = 0) {
    if (isWin) {
      return 100 + Math.min(streak * 20, 100);
    } else {
      return 50 + Math.min(streak * 10, 50);
    }
  }
  
  static calculateHealthLoss(damage, round) {
    const baseDamage = Math.max(1, damage);
    const roundMultiplier = 1 + (round - 1) * 0.1;
    
    return Math.floor(baseDamage * roundMultiplier);
  }
}

module.exports = EconomyService;

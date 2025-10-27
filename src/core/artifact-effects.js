export class ArtifactEffects {
  static processRoundStartEffects(player, roundNumber, players = []) {
    if (!player.hero.persistentEffects) return 0;
    
    let goldGained = 0;
    const effects = player.hero.persistentEffects;
    
    if (effects.fortuneCat) {
      goldGained += effects.fortuneCat;
    }
    
    if (effects.bondsValue && roundNumber === 10) {
      goldGained += effects.bondsValue;
    }
    
    if (effects.midasReward && roundNumber === 18) {
      goldGained += effects.midasReward;
    }
    
    if (effects.luckyDice) {
      const diceRoll = Math.floor(Math.random() * 6) + 1;
      goldGained += diceRoll * 10;
    }
    
    if (effects.victoryDodge) {
      const winStreak = player.consecutiveWins || 0;
      const lossStreak = player.consecutiveLosses || 0;
      const currentStreak = Math.max(winStreak, lossStreak);
      if (currentStreak < 4) {
        goldGained += effects.victoryDodge;
      }
    }
    
    if (effects.explorersMap) {
      goldGained += effects.explorersMap;
    }
    
    if (effects.consumerismTriggered) {
      goldGained += effects.consumerism || 0;
      effects.consumerismTriggered = false;
    }
    
    if (effects.eliminationPactBase) {
      goldGained += effects.eliminationPactBase;
      const eliminatedCount = (players || []).filter(p => p.isEliminated).length;
      if (eliminatedCount > 0) {
        goldGained += eliminatedCount * (effects.eliminationPactBonus || 20);
      }
    }
    
    if (effects.hemocoinMultiplier && player.playerHealth) {
      const currentHP = player.playerHealth.currentHealth || 0;
      goldGained += currentHP * effects.hemocoinMultiplier;
    }
    
    if (effects.unyieldingResolve && player.playerHealth) {
      const currentHP = player.playerHealth.currentHealth || 0;
      if (currentHP <= 25 && currentHP > 0) {
        goldGained += effects.unyieldingResolve;
      }
    }
    
    if (effects.blankWillValue) {
      const eliminatedCount = (players || []).filter(p => p.isEliminated).length;
      goldGained += eliminatedCount * effects.blankWillValue;
    }
    
    if (effects.luckyDice2) {
      const roll = Math.floor(Math.random() * 8) + 1;
      goldGained += roll * 10 + 30;
    }
    
    if (effects.unyieldingResolve2 && player.playerHealth) {
      const currentHP = player.playerHealth.currentHealth || 0;
      if (currentHP <= 23 && currentHP > 0) {
        goldGained += effects.unyieldingResolve2;
      }
    }
    
    return goldGained;
  }
  
  static processVictoryEffects(winner, loser, players = []) {
    if (!winner.hero.persistentEffects) return 0;
    
    let goldGained = 0;
    const effects = winner.hero.persistentEffects;
    
    if (effects.duelGrailGold) {
      effects.duelGrailGold *= 2;
      if (effects.duelGrailGold >= 400) {
        goldGained += effects.duelGrailGold;
        effects.duelGrailGold = 50;
      }
    }
    
    if (effects.parasiteTargetId) {
      const allPlayers = players || window.currentPlayers || [];
      allPlayers.forEach(p => {
        if (p.id === effects.parasiteTargetId) {
          if (p.consecutiveWins && p.consecutiveWins > 0) {
            goldGained += effects.parasiteValue || 75;
          }
        }
      });
    }
    
    if (effects.goldenEggStacks && effects.goldenEggStacks > 0) {
      effects.goldenEggStacks--;
      if (effects.goldenEggStacks <= 0) {
        effects.goldenEggReady = true;
      }
    }
    
    return goldGained;
  }
  
  static processDefeatEffects(loser, hpLost) {
    if (!loser.hero.persistentEffects) return 0;
    
    let goldGained = 0;
    const effects = loser.hero.persistentEffects;
    
    if (effects.duelGrailGold) {
      const halfGold = Math.floor(effects.duelGrailGold * 0.5);
      goldGained += halfGold;
      effects.duelGrailGold = 50;
    }
    
    if (effects.lifeInsurance && hpLost > 0) {
      goldGained += effects.lifeInsurance * hpLost;
    }
    
    if (effects.goldenEggStacks && effects.goldenEggStacks > 0) {
      effects.goldenEggStacks -= 2;
      if (effects.goldenEggStacks <= 0) {
        effects.goldenEggStacks = 0;
        effects.goldenEggReady = true;
      }
    }
    
    return goldGained;
  }
  
  static processAbilityPurchase(player) {
    if (!player.hero.persistentEffects) return 0;
    
    let goldGained = 0;
    const effects = player.hero.persistentEffects;
    
    if (effects.explorersShovel) {
      goldGained += 20;
    }
    
    return goldGained;
  }
  
  static processPurchase(player) {
    if (!player.hero.persistentEffects) return 0;
    
    let goldRefund = 0;
    const effects = player.hero.persistentEffects;
    
    if (effects.rebate) {
      goldRefund += effects.rebate;
    }
    
    if (effects.noBuyBonusActive) {
      effects.noBuyBonusActive = false;
    }
    
    return goldRefund;
  }
  
  static processNoBuyBonus(player, madeAnyPurchase) {
    if (!player.hero.persistentEffects) return 0;
    
    let goldGained = 0;
    const effects = player.hero.persistentEffects;
    
    if (effects.noBuyBonus && effects.noBuyBonusActive && !madeAnyPurchase) {
      goldGained += effects.noBuyBonus;
    }
    
    effects.noBuyBonusActive = true;
    
    return goldGained;
  }
  
  static getRerollDiscount(player) {
    if (!player.hero.persistentEffects) return 0;
    
    const effects = player.hero.persistentEffects;
    return effects.membershipCard || 0;
  }
  
  static checkSecondFreeReroll(player) {
    if (!player.hero.persistentEffects) return false;
    
    const effects = player.hero.persistentEffects;
    if (effects.secondFreeChance) {
      const chance = effects.secondFreeChance / 100;
      return Math.random() < chance;
    }
    
    return false;
  }
  
  static getLoanPenalty(player) {
    if (!player.hero.persistentEffects) return 0;
    
    const effects = player.hero.persistentEffects;
    if (effects.loanRoundsRemaining && effects.loanRoundsRemaining > 0) {
      return effects.loanPenalty || 0;
    }
    
    return 0;
  }
  
  static decrementLoanRounds(player) {
    if (!player.hero.persistentEffects) return;
    
    const effects = player.hero.persistentEffects;
    if (effects.loanRoundsRemaining && effects.loanRoundsRemaining > 0) {
      effects.loanRoundsRemaining--;
    }
  }
  
  static processRoundEnd(player) {
    if (!player.hero.persistentEffects) return;
    
    const effects = player.hero.persistentEffects;
    if (effects.consumerism && player.gold < 200) {
      effects.consumerismTriggered = true;
    }
  }
  
  static getFateRerollPenalty(player) {
    if (!player.hero.persistentEffects) return 0;
    return player.hero.persistentEffects.fateRerollPenalty || 0;
  }
  
  static processFreeGiftReroll(player) {
    if (!player.hero.persistentEffects) return;
    
    const effects = player.hero.persistentEffects;
    if (effects.freeGiftThreshold) {
      effects.freeGiftRerollCount = (effects.freeGiftRerollCount || 0) + 1;
      if (effects.freeGiftRerollCount >= effects.freeGiftThreshold) {
        effects.freeGiftActive = true;
        effects.freeGiftRerollCount = 0;
      }
    }
  }
  
  static checkAndConsumeFreeGift(player) {
    if (!player.hero.persistentEffects) return false;
    
    const effects = player.hero.persistentEffects;
    if (effects.freeGiftActive) {
      effects.freeGiftActive = false;
      return true;
    }
    return false;
  }
  
  static processBigSpenderReroll(player) {
    if (!player.hero.persistentEffects) return;
    
    const effects = player.hero.persistentEffects;
    if (effects.bigSpenderThreshold) {
      effects.bigSpenderRerollCount = (effects.bigSpenderRerollCount || 0) + 1;
      if (effects.bigSpenderRerollCount >= effects.bigSpenderThreshold) {
        effects.bigSpenderActive = true;
        effects.bigSpenderRerollCount = 0;
      }
    }
  }
  
  static checkAndConsumeBigSpender(player) {
    if (!player.hero.persistentEffects) return false;
    
    const effects = player.hero.persistentEffects;
    if (effects.bigSpenderActive) {
      effects.bigSpenderActive = false;
      return true;
    }
    return false;
  }
  
  static checkGoldenEggReady(player) {
    if (!player.hero.persistentEffects) return false;
    return player.hero.persistentEffects.goldenEggReady || false;
  }
  
  static consumeGoldenEgg(player) {
    if (!player.hero.persistentEffects) return;
    player.hero.persistentEffects.goldenEggReady = false;
  }
  
  static getProvidenceScepterBonus(player) {
    if (!player.hero.persistentEffects) return 0;
    return player.hero.persistentEffects.providenceScepter || 0;
  }
  
  static getLuckyDayBonus(player) {
    if (!player.hero.persistentEffects) return 0;
    
    const effects = player.hero.persistentEffects;
    if (!effects.luckyDayBonus) return 0;
    
    const artifactCount = (player.hero.artifacts || []).length;
    return artifactCount * effects.luckyDayBonus;
  }
  
  static processUrnOfSoul(player, players = []) {
    if (!player.hero.persistentEffects || !player.playerHealth) return 0;
    
    const effects = player.hero.persistentEffects;
    if (!effects.urnOfSoulFirst) return 0;
    
    const eliminatedCount = (players || []).filter(p => p.isEliminated).length;
    if (eliminatedCount === 0) return 0;
    
    let hpRestore = 0;
    if (!effects.urnOfSoulUsedFirst) {
      hpRestore = effects.urnOfSoulFirst;
      effects.urnOfSoulUsedFirst = true;
    } else {
      hpRestore = effects.urnOfSoulSubsequent * (eliminatedCount - 1);
    }
    
    return hpRestore;
  }
  
  static processUltimateRescue(player) {
    if (!player.hero.persistentEffects || !player.playerHealth) return { rescued: false, gold: 0 };
    
    const effects = player.hero.persistentEffects;
    if (effects.ultimateRescueUsed || !effects.ultimateRescueGold) {
      return { rescued: false, gold: 0 };
    }
    
    const currentHP = player.playerHealth.currentHealth || 0;
    if (currentHP <= 0) {
      effects.ultimateRescueUsed = true;
      return { rescued: true, gold: effects.ultimateRescueGold };
    }
    
    return { rescued: false, gold: 0 };
  }
}

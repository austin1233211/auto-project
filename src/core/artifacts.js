export const ARTIFACTS_BY_ROUND = {
  3: [
    { name: 'Duel Grail', effect: 'duel_grail', value: 50, emoji: '🏆', description: 'Starts with 50 gold, doubles each victory. Get 400 gold when full, 50% on loss' },
    { name: 'Explorer\'s Shovel', effect: 'explorers_shovel', value: 20, emoji: '⛏️', description: 'Gain 20 gold when buying a new ability' },
    { name: 'Fortune Cat', effect: 'fortune_cat', value: 45, emoji: '🐱', description: 'Gain 45 gold per round' },
    { name: 'Bonds', effect: 'bonds', value: 900, emoji: '📜', description: 'Gain 900 gold when you reach round 10' },
    { name: 'Life Insurance', effect: 'life_insurance', value: 25, emoji: '🏥', description: 'When you lose player HP, gain 25 gold per HP lost' },
    { name: 'Loan Agreement', effect: 'loan_agreement', value: 700, emoji: '💰', description: 'Gain 700 gold now, reduce base gold income by 50 for next 6 rounds' },
    { name: 'Lucky Dice', effect: 'lucky_dice', value: 0, emoji: '🎲', description: 'Roll a dice each round and gain 10-60 gold' },
    { name: 'Membership Card', effect: 'membership_card', value: 10, emoji: '💳', description: 'Reduce the price of refreshes by 10 gold' },
    { name: 'Midas Reward', effect: 'midas_reward', value: 1300, emoji: '👑', description: 'Gain 1300 gold at round 18' },
    { name: 'New Years Gift', effect: 'new_years_gift', value: 500, emoji: '🎁', description: 'Gain 500 gold immediately' },
    { name: 'No Buy Bonus', effect: 'no_buy_bonus', value: 90, emoji: '🚫', description: 'If you don\'t spend gold this round, gain 90 gold after round' },
    { name: 'Parasite', effect: 'parasite', value: 75, emoji: '🦠', description: 'Choose a player, earn 75 gold each time they win a battle' },
    { name: 'Rebate', effect: 'rebate', value: 15, emoji: '💵', description: 'Return 15 gold when making a purchase' },
    { name: 'Second Free', effect: 'second_free', value: 45, emoji: '🔄', description: 'You have a 45% chance to get a free reroll after you reroll' },
    { name: 'Victory Dodge', effect: 'victory_dodge', value: 60, emoji: '🎯', description: 'When current win/lose streak is less than 4 rounds, gain 60 gold per round' },
    { name: 'Explorer\'s Map', effect: 'explorers_map', value: 30, emoji: '🗺️', description: 'Gain 30 gold when entering a new shop phase' }
  ],
  8: [
    { name: 'Consumerism', effect: 'consumerism', value: 70, emoji: '🛒', description: 'If you have less than 200 gold at end of round, gain 70 gold next round' },
    { name: 'Elimination Pact', effect: 'elimination_pact', value: 35, emoji: '💀', description: 'Gain 35 gold each round, +20 gold per round for each eliminated player' },
    { name: 'Explorer\'s Shovel', effect: 'explorers_shovel', value: 20, emoji: '⛏️', description: 'Gain 20 gold when buying a new ability' },
    { name: 'Fate', effect: 'fate', value: 750, emoji: '🎴', description: 'Get 750 gold immediately, reroll cost increased by 10' },
    { name: 'Free Gift', effect: 'free_gift', value: 11, emoji: '🎀', description: 'After every 11 rerolls, next ability purchase is free' },
    { name: 'Hemocoin', effect: 'hemocoin', value: 2, emoji: '🩸', description: 'Grants gold equal to 2x player HP per round' },
    { name: 'Loan Agreement 2', effect: 'loan_agreement_2', value: 700, emoji: '💰', description: 'Gain 700 gold now, reduce base gold income by 60 for next 4 rounds' },
    { name: 'Membership Card', effect: 'membership_card', value: 10, emoji: '💳', description: 'Reduce the price of refreshes by 10 gold' },
    { name: 'New Years Gift', effect: 'new_years_gift', value: 500, emoji: '🎁', description: 'Gain 500 gold immediately' },
    { name: 'No Buy Bonus 2', effect: 'no_buy_bonus_2', value: 135, emoji: '🚫', description: 'If you don\'t spend gold this round, gain 135 gold after round' },
    { name: 'Rebate', effect: 'rebate', value: 15, emoji: '💵', description: 'Return 15 gold when making a purchase' },
    { name: 'Second Free', effect: 'second_free', value: 45, emoji: '🔄', description: 'You have a 45% chance to get a free reroll after you reroll' },
    { name: 'Unyielding Resolve', effect: 'unyielding_resolve', value: 100, emoji: '⚡', description: 'When player HP ≤ 25, gain 100 gold per round' }
  ],
  13: [
    { name: 'Big Spender', effect: 'big_spender', value: 15, emoji: '💸', description: 'After 15 rerolls, choose 1 of 3 random tier 3 abilities' },
    { name: 'Blank Will', effect: 'blank_will', value: 200, emoji: '📄', description: 'For every other player eliminated, gain 200 gold' },
    { name: 'Consumerism 2', effect: 'consumerism_2', value: 85, emoji: '🛒', description: 'If gold < 200 at round end, gain 85 gold next round' },
    { name: 'Fate', effect: 'fate', value: 750, emoji: '🎴', description: 'Get 750 gold immediately, reroll cost increased by 10' },
    { name: 'Free Gift', effect: 'free_gift', value: 11, emoji: '🎀', description: 'After every 11 rerolls, next ability purchase is free' },
    { name: 'Golden Egg', effect: 'golden_egg', value: 6, emoji: '🥚', description: 'Starts with 6 counters, -1 on win, -2 on loss, choose tier 3 ability at 0' },
    { name: 'Loan Agreement 3', effect: 'loan_agreement_3', value: 800, emoji: '💰', description: 'Immediate 800 gold, -150 income for 2 rounds' },
    { name: 'Lucky Day', effect: 'lucky_day', value: 30, emoji: '☀️', description: 'For each artifact owned, +30% chance for higher tier abilities in rerolls' },
    { name: 'Lucky Dice 2', effect: 'lucky_dice_2', value: 0, emoji: '🎲', description: 'Random 40-110 gold each round' },
    { name: 'New Years Gift 2', effect: 'new_years_gift_2', value: 600, emoji: '🎁', description: 'Gain 600 gold immediately' },
    { name: 'Providence Scepter', effect: 'providence_scepter', value: 2, emoji: '🔱', description: '+2% chance of tier 3 abilities in store' },
    { name: 'Second Free', effect: 'second_free', value: 45, emoji: '🔄', description: 'You have a 45% chance to get a free reroll after you reroll' },
    { name: 'Unyielding Resolve 2', effect: 'unyielding_resolve_2', value: 110, emoji: '⚡', description: '110 gold per round when HP ≤ 23' },
    { name: 'Urn of Soul', effect: 'urn_of_soul', value: 6, emoji: '⚱️', description: 'Restore 6 HP on first elimination, 3 HP per subsequent elimination' },
    { name: 'Ultimate Rescue', effect: 'ultimate_rescue', value: 500, emoji: '🆘', description: 'When eliminated first time, keep 1 HP and gain 500 gold' }
  ]
};

export class ArtifactSystem {
  constructor() {
    this.selectedArtifacts = [];
  }

  getArtifactsForRound(roundNumber) {
    return ARTIFACTS_BY_ROUND[roundNumber] || [];
  }

  selectRandomArtifacts(roundNumber, count = 3) {
    const availableArtifacts = this.getArtifactsForRound(roundNumber);
    const shuffled = [...availableArtifacts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, availableArtifacts.length));
  }

  applyArtifactToHero(hero, artifact) {
    const modifiedHero = { ...hero };
    
    if (!modifiedHero.artifacts) {
      modifiedHero.artifacts = [];
    }
    modifiedHero.artifacts.push(artifact);

    if (!modifiedHero.persistentEffects) {
      modifiedHero.persistentEffects = {};
    }

    switch (artifact.effect) {
      case 'duel_grail':
        modifiedHero.persistentEffects.duelGrailGold = 50;
        break;
      case 'explorers_shovel':
        modifiedHero.persistentEffects.explorersShovel = true;
        break;
      case 'fortune_cat':
        modifiedHero.persistentEffects.fortuneCat = artifact.value;
        break;
      case 'bonds':
        modifiedHero.persistentEffects.bondsValue = artifact.value;
        break;
      case 'life_insurance':
        modifiedHero.persistentEffects.lifeInsurance = artifact.value;
        break;
      case 'loan_agreement':
        modifiedHero.persistentEffects.loanRoundsRemaining = 6;
        modifiedHero.persistentEffects.loanPenalty = 50;
        break;
      case 'lucky_dice':
        modifiedHero.persistentEffects.luckyDice = true;
        break;
      case 'membership_card':
        modifiedHero.persistentEffects.membershipCard = artifact.value;
        break;
      case 'midas_reward':
        modifiedHero.persistentEffects.midasReward = artifact.value;
        break;
      case 'new_years_gift':
        modifiedHero.persistentEffects.newYearsGift = artifact.value;
        break;
      case 'no_buy_bonus':
        modifiedHero.persistentEffects.noBuyBonus = artifact.value;
        modifiedHero.persistentEffects.noBuyBonusActive = true;
        break;
      case 'parasite':
        modifiedHero.persistentEffects.parasiteValue = artifact.value;
        modifiedHero.persistentEffects.parasiteTargetId = null; // Will be set by UI
        break;
      case 'rebate':
        modifiedHero.persistentEffects.rebate = artifact.value;
        break;
      case 'second_free':
        modifiedHero.persistentEffects.secondFreeChance = artifact.value;
        break;
      case 'victory_dodge':
        modifiedHero.persistentEffects.victoryDodge = artifact.value;
        break;
      case 'explorers_map':
        modifiedHero.persistentEffects.explorersMap = artifact.value;
        break;
        
      case 'consumerism':
        modifiedHero.persistentEffects.consumerism = artifact.value;
        modifiedHero.persistentEffects.consumerismTriggered = false;
        break;
      case 'elimination_pact':
        modifiedHero.persistentEffects.eliminationPactBase = artifact.value;
        modifiedHero.persistentEffects.eliminationPactBonus = 20;
        break;
      case 'fate':
        modifiedHero.persistentEffects.fateGoldReceived = artifact.value;
        modifiedHero.persistentEffects.fateRerollPenalty = 10;
        break;
      case 'free_gift':
        modifiedHero.persistentEffects.freeGiftRerollCount = 0;
        modifiedHero.persistentEffects.freeGiftThreshold = artifact.value;
        modifiedHero.persistentEffects.freeGiftActive = false;
        break;
      case 'hemocoin':
        modifiedHero.persistentEffects.hemocoinMultiplier = artifact.value;
        break;
      case 'loan_agreement_2':
        modifiedHero.persistentEffects.loanRoundsRemaining = 4;
        modifiedHero.persistentEffects.loanPenalty = 60;
        break;
      case 'no_buy_bonus_2':
        modifiedHero.persistentEffects.noBuyBonus = artifact.value;
        modifiedHero.persistentEffects.noBuyBonusActive = true;
        break;
      case 'unyielding_resolve':
        modifiedHero.persistentEffects.unyieldingResolve = artifact.value;
        break;
        
      case 'big_spender':
        modifiedHero.persistentEffects.bigSpenderRerollCount = 0;
        modifiedHero.persistentEffects.bigSpenderThreshold = artifact.value;
        modifiedHero.persistentEffects.bigSpenderActive = false;
        break;
      case 'blank_will':
        modifiedHero.persistentEffects.blankWillValue = artifact.value;
        break;
      case 'consumerism_2':
        modifiedHero.persistentEffects.consumerism = artifact.value;
        modifiedHero.persistentEffects.consumerismTriggered = false;
        break;
      case 'golden_egg':
        modifiedHero.persistentEffects.goldenEggStacks = artifact.value;
        modifiedHero.persistentEffects.goldenEggReady = false;
        break;
      case 'loan_agreement_3':
        modifiedHero.persistentEffects.loanRoundsRemaining = 2;
        modifiedHero.persistentEffects.loanPenalty = 150;
        break;
      case 'lucky_day':
        modifiedHero.persistentEffects.luckyDayBonus = artifact.value;
        break;
      case 'lucky_dice_2':
        modifiedHero.persistentEffects.luckyDice2 = true;
        break;
      case 'new_years_gift_2':
        modifiedHero.persistentEffects.newYearsGift2 = artifact.value;
        break;
      case 'providence_scepter':
        modifiedHero.persistentEffects.providenceScepter = artifact.value;
        break;
      case 'unyielding_resolve_2':
        modifiedHero.persistentEffects.unyieldingResolve2 = artifact.value;
        break;
      case 'urn_of_soul':
        modifiedHero.persistentEffects.urnOfSoulFirst = artifact.value;
        modifiedHero.persistentEffects.urnOfSoulSubsequent = 3;
        modifiedHero.persistentEffects.urnOfSoulUsedFirst = false;
        break;
      case 'ultimate_rescue':
        modifiedHero.persistentEffects.ultimateRescueGold = artifact.value;
        modifiedHero.persistentEffects.ultimateRescueUsed = false;
        break;
        
      case 'mana_efficiency':
        modifiedHero.stats.manaEfficiency = (modifiedHero.stats.manaEfficiency || 0) + artifact.value;
        break;
      case 'gold_bonus':
        modifiedHero.stats.goldBonus = (modifiedHero.stats.goldBonus || 0) + artifact.value;
        break;
      case 'attack_aura':
        modifiedHero.stats.attack = Math.round(modifiedHero.stats.attack * (1 + artifact.value / 100));
        break;
      case 'damage_reduction':
        modifiedHero.stats.damageReduction = (modifiedHero.stats.damageReduction || 0) + artifact.value;
        break;
      case 'speed_aura':
        modifiedHero.stats.speed = Math.round(modifiedHero.stats.speed * (1 + artifact.value / 100));
        break;
      case 'team_boost':
        modifiedHero.stats.abilityDamageBonus = (modifiedHero.stats.abilityDamageBonus || 0) + artifact.value;
        break;
      case 'ability_enhance':
        modifiedHero.stats.abilityEffectiveness = (modifiedHero.stats.abilityEffectiveness || 0) + artifact.value;
        break;
      case 'health_regen':
        modifiedHero.stats.healthRegeneration = (modifiedHero.stats.healthRegeneration || 0) + artifact.value;
        break;
      case 'stealth_bonus':
        modifiedHero.stats.evasionChance = (modifiedHero.stats.evasionChance || 0) + (artifact.value / 100);
        break;
      case 'ultimate_artifact':
        modifiedHero.stats.attack = Math.round(modifiedHero.stats.attack * (1 + artifact.value / 100));
        modifiedHero.stats.health = Math.round(modifiedHero.stats.health * (1 + artifact.value / 100));
        modifiedHero.stats.speed = Math.round(modifiedHero.stats.speed * (1 + artifact.value / 100));
        modifiedHero.stats.armor = Math.round(modifiedHero.stats.armor * (1 + artifact.value / 100));
        break;
      case 'legendary_weapon':
        modifiedHero.stats.attack += artifact.value;
        modifiedHero.stats.critChance = (modifiedHero.stats.critChance || 0) + 0.50;
        break;
      case 'legendary_armor':
        modifiedHero.stats.armor += artifact.value;
        modifiedHero.stats.debuffImmunity = true;
        break;
      case 'time_manipulation':
        modifiedHero.stats.extraActions = (modifiedHero.stats.extraActions || 0) + artifact.value;
        break;
      case 'resurrection':
        modifiedHero.stats.reviveCount = (modifiedHero.stats.reviveCount || 0) + artifact.value;
        break;
    }

    return modifiedHero;
  }
}

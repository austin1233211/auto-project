const express = require('express');
const Hero = require('../models/Hero');
const Ability = require('../models/Ability');
const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const CombatService = require('../services/CombatService');
const EconomyService = require('../services/EconomyService');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/heroes', auth, async (req, res) => {
  try {
    const heroRows = await Hero.findAll();
    
    const heroes = heroRows.map(hero => ({
      id: hero.id,
      name: hero.name,
      class: hero.class,
      avatar: getHeroAvatar(hero.name),
      stats: {
        health: parseFloat(hero.base_health),
        attack: parseFloat(hero.base_attack),
        armor: parseFloat(hero.base_armor),
        speed: parseFloat(hero.base_speed),
        critChance: 0.05,
        critDamage: 1.5,
        evasionChance: 0.05,
        evasionDamageReduction: 0.5,
        magicDamageReduction: 0,
        physicalDamageAmplification: 0,
        magicDamageAmplification: 0,
        manaRegeneration: 0.1,
        attackSpeed: 0,
        goldBonus: 0,
        counterChance: 0,
        lowHealthDamageBonus: 0,
        damageImmunityChance: 0,
        abilityCooldownReduction: 0,
        deathSaveCharges: 0
      },
      passiveAbility: {
        name: hero.passive_ability_name,
        description: hero.passive_ability_description
      },
      ultimateAbility: {
        name: hero.ultimate_ability_name,
        description: hero.ultimate_ability_description
      },
      purchasedAbilities: [],
      artifacts: [],
      equipment: []
    }));
    
    res.json({ heroes });
  } catch (error) {
    console.error('Get heroes error:', error);
    res.status(500).json({ error: 'Failed to get heroes' });
  }
});

function getHeroAvatar(heroName) {
  const avatars = {
    'Pudge': '🥩',
    'Slark': '🐟', 
    'Dragon Knight': '🐲',
    'Crystal Maiden': '❄️',
    'Invoker': '🔮',
    'Anti-Mage': '⚡',
    'Phantom Assassin': '🗡️',
    'Drow Ranger': '🏹'
  };
  return avatars[heroName] || '⚔️';
}

router.get('/tournaments/:id/shop', auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    
    const players = await Tournament.getPlayers(req.params.id);
    const currentPlayer = players.find(p => p.player_id === req.player.playerId);
    
    if (!currentPlayer) {
      return res.status(403).json({ error: 'Not participating in this tournament' });
    }
    
    const currentRound = tournament.current_round;
    const tierProbabilities = EconomyService.getTierProbabilities(currentRound);
    const shopItems = await EconomyService.generateShopItems(tierProbabilities);
    
    res.json({
      shopItems,
      playerGold: currentPlayer.gold,
      currentRound
    });
    
  } catch (error) {
    console.error('Get shop error:', error);
    res.status(500).json({ error: 'Failed to get shop items' });
  }
});

router.post('/tournaments/:id/shop/purchase', auth, async (req, res) => {
  try {
    const { abilityId } = req.body;
    
    if (!abilityId) {
      return res.status(400).json({ error: 'Ability ID is required' });
    }
    
    const players = await Tournament.getPlayers(req.params.id);
    const currentPlayer = players.find(p => p.player_id === req.player.playerId);
    
    if (!currentPlayer) {
      return res.status(403).json({ error: 'Not participating in this tournament' });
    }
    
    const purchase = await Ability.purchaseForPlayer(currentPlayer.id, abilityId);
    
    res.json({
      message: 'Ability purchased successfully',
      purchase: purchase.purchase,
      ability: purchase.ability,
      newGold: purchase.newGold
    });
    
  } catch (error) {
    console.error('Purchase ability error:', error);
    
    if (error.message === 'Insufficient gold' || error.message === 'Ability already purchased') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to purchase ability' });
  }
});

router.get('/tournaments/:id/matches', auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    
    const matches = await Match.findByTournamentRound(req.params.id, tournament.current_round);
    res.json({ matches, currentRound: tournament.current_round });
    
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
});

router.get('/matches/:id', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    const events = await Match.getEvents(req.params.id);
    
    res.json({
      match,
      events
    });
    
  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({ error: 'Failed to get match' });
  }
});

router.post('/matches/:id/simulate', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    if (match.status !== 'pending') {
      return res.status(400).json({ error: 'Match already started or completed' });
    }
    
    await Match.updateStatus(req.params.id, 'in_progress');
    
    const result = await CombatService.simulateBattle(match);
    
    await Match.completeMatch(req.params.id, result);
    
    res.json({
      message: 'Battle simulation completed',
      result
    });
    
  } catch (error) {
    console.error('Simulate match error:', error);
    res.status(500).json({ error: 'Failed to simulate match' });
  }
});

module.exports = router;

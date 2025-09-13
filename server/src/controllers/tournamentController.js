const express = require('express');
const Tournament = require('../models/Tournament');
const Hero = require('../models/Hero');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const tournaments = await Tournament.findActive();
    res.json({ tournaments });
  } catch (error) {
    console.error('Get tournaments error:', error);
    res.status(500).json({ error: 'Failed to get tournaments' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, maxPlayers = 8 } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Tournament name is required' });
    }
    
    const tournament = await Tournament.create({
      name,
      maxPlayers,
      createdBy: req.player.playerId
    });
    
    res.status(201).json({
      message: 'Tournament created successfully',
      tournament
    });
    
  } catch (error) {
    console.error('Create tournament error:', error);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

router.get('/:id', auth, async (req, res) => {
  console.log('=== TOURNAMENT CONTROLLER: GET /:id endpoint hit ===');
  console.log('=== TOURNAMENT CONTROLLER: Tournament ID:', req.params.id);
  console.log('=== TOURNAMENT CONTROLLER: Auth user:', req.player);
  
  try {
    const tournament = await Tournament.findById(req.params.id);
    console.log('=== TOURNAMENT CONTROLLER: Tournament found ===', tournament);
    
    if (!tournament) {
      console.log('=== TOURNAMENT CONTROLLER: Tournament not found, returning 404 ===');
      return res.status(404).json({ error: 'Tournament not found' });
    }
    
    console.log('=== TOURNAMENT CONTROLLER: Calling Tournament.getPlayers ===');
    const players = await Tournament.getPlayers(req.params.id);
    console.log('=== TOURNAMENT CONTROLLER: Raw players from database ===', players);
    console.log('=== TOURNAMENT CONTROLLER: First player structure ===', players[0]);
    console.log('=== TOURNAMENT CONTROLLER: Players array length ===', players.length);
    
    const responseData = {
      tournament: {
        ...tournament,
        players
      }
    };
    
    console.log('=== TOURNAMENT CONTROLLER: Final response data ===', JSON.stringify(responseData, null, 2));
    console.log('=== TOURNAMENT CONTROLLER: Response players array ===', responseData.tournament.players);
    console.log('=== TOURNAMENT CONTROLLER: About to send response ===');
    
    res.json(responseData);
    console.log('=== TOURNAMENT CONTROLLER: Response sent successfully ===');
    
  } catch (error) {
    console.error('=== TOURNAMENT CONTROLLER: Error occurred ===', error);
    console.error('Get tournament error:', error);
    res.status(500).json({ error: 'Failed to get tournament' });
  }
});

router.post('/:id/join', auth, async (req, res) => {
  try {
    const { heroId } = req.body;
    
    if (!heroId) {
      return res.status(400).json({ error: 'Hero selection is required' });
    }
    
    const hero = await Hero.findById(heroId);
    if (!hero) {
      return res.status(400).json({ error: 'Invalid hero selected' });
    }
    
    const tournamentPlayer = await Tournament.addPlayer(
      req.params.id,
      req.player.playerId,
      heroId
    );
    
    res.status(201).json({
      message: 'Successfully joined tournament',
      tournamentPlayer
    });
    
  } catch (error) {
    console.error('Join tournament error:', error);
    
    if (error.message === 'Tournament is full') {
      return res.status(400).json({ error: 'Tournament is full' });
    }
    
    res.status(500).json({ error: 'Failed to join tournament' });
  }
});

router.delete('/:id/leave', auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    
    if (tournament.status !== 'waiting') {
      return res.status(400).json({ error: 'Cannot leave tournament after it has started' });
    }
    
    res.json({ message: 'Left tournament successfully' });
    
  } catch (error) {
    console.error('Leave tournament error:', error);
    res.status(500).json({ error: 'Failed to leave tournament' });
  }
});

router.get('/:id/players', auth, async (req, res) => {
  try {
    const players = await Tournament.getPlayers(req.params.id);
    res.json({ players });
  } catch (error) {
    console.error('Get tournament players error:', error);
    res.status(500).json({ error: 'Failed to get tournament players' });
  }
});

router.get('/:id/leaderboard', auth, async (req, res) => {
  try {
    const players = await Tournament.getPlayers(req.params.id);
    
    const leaderboard = players
      .filter(p => !p.is_eliminated)
      .sort((a, b) => {
        if (a.consecutive_wins !== b.consecutive_wins) {
          return b.consecutive_wins - a.consecutive_wins;
        }
        return b.current_health - a.current_health;
      });
    
    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

module.exports = router;

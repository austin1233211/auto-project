const express = require('express');
const Player = require('../models/Player');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/profile', auth, async (req, res) => {
  try {
    const player = await Player.findById(req.player.playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.json({ player });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { username } = req.body;
    const updates = {};
    
    if (username && username !== req.player.username) {
      const existingUsername = await Player.findByUsername(username);
      if (existingUsername && existingUsername.id !== req.player.playerId) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      updates.username = username;
    }
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }
    
    const updatedPlayer = await Player.updateProfile(req.player.playerId, updates);
    
    res.json({
      message: 'Profile updated successfully',
      player: updatedPlayer
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;

const express = require('express');
const jwt = require('jsonwebtoken');
const Player = require('../models/Player');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    const existingUser = await Player.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const existingUsername = await Player.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    
    const player = await Player.create({ username, email, password });
    
    const token = jwt.sign(
      { playerId: player.id, username: player.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    res.status(201).json({
      message: 'Player registered successfully',
      player: {
        id: player.id,
        username: player.username,
        email: player.email
      },
      token
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const player = await Player.findByEmail(email);
    if (!player) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await Player.validatePassword(password, player.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { playerId: player.id, username: player.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    res.json({
      message: 'Login successful',
      player: {
        id: player.id,
        username: player.username,
        email: player.email
      },
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', auth, async (req, res) => {
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

router.post('/refresh', auth, async (req, res) => {
  try {
    const token = jwt.sign(
      { playerId: req.player.playerId, username: req.player.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    res.json({ token });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

module.exports = router;

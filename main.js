import { GameModeSelection } from './game-mode-selection.js';
import { HeroSelection } from './hero-selection.js';
import { PlayerHealth } from './player-health.js';
import { RoundsManager } from './rounds-manager.js';
import { HeroStatsCard } from './hero-stats-card.js';

class AutoGladiators {
  constructor() {
    this.currentScreen = 'login';
    this.selectedHero = null;
    this.selectedMode = null;
    this.currentTournament = null;
    this.playerHealth = new PlayerHealth();
    this.heroStatsCard = new HeroStatsCard();
    this.socket = null;
    this.init();
  }

  async init() {
    await this.initAuth();
    this.initGameModeSelection();
    this.initHeroSelection();
    this.initPlayerHealth();
    this.initRounds();
    this.initHeroStatsCard();
  }

  async initAuth() {
    authManager.setAuthChangeCallback((isAuthenticated, player) => {
      if (isAuthenticated) {
        this.onAuthSuccess(player);
      } else {
        this.onAuthRequired();
      }
    });

    await authManager.initialize();
  }

  onAuthSuccess(player) {
    console.log('Authenticated as:', player.username);
    this.socket = apiClient.connectWebSocket();
    this.setupWebSocketEvents();
    this.switchScreen('game-mode-selection');
  }

  onAuthRequired() {
    console.log('Authentication required');
    authManager.showLoginForm();
  }

  setupWebSocketEvents() {
    if (!this.socket) return;

    this.socket.on('tournament_state', (state) => {
      this.handleTournamentStateUpdate(state);
    });

    this.socket.on('battle_started', (data) => {
      console.log('Battle started:', data);
    });

    this.socket.on('battle_completed', (data) => {
      console.log('Battle completed:', data);
      if (this.rounds) {
        this.rounds.handleBattleCompleted(data);
      }
    });

    this.socket.on('tournament_update', (data) => {
      if (this.rounds) {
        this.rounds.handleTournamentUpdate(data);
      }
    });

    this.socket.on('timer_update', (data) => {
      if (this.rounds) {
        this.rounds.handleTimerUpdate(data);
      }
    });

    this.socket.on('player_purchase', (data) => {
      console.log('Player purchase:', data);
    });
  }

  handleTournamentStateUpdate(state) {
    this.currentTournament = state.tournament;
    if (this.rounds) {
      this.rounds.updateTournamentState(state);
    }
  }

  initGameModeSelection() {
    const gameModeContainer = document.getElementById('game-mode-selection');
    const gameModeSelection = new GameModeSelection(gameModeContainer);

    gameModeSelection.setOnModeSelected((mode) => {
      this.selectedMode = mode;
      this.switchScreen('hero-selection');
    });
  }

  initHeroSelection() {
    const heroSelectionContainer = document.getElementById('hero-selection');
    this.heroSelection = new HeroSelection(heroSelectionContainer);

    this.heroSelection.setOnTournamentStart(async () => {
      this.selectedHero = this.heroSelection.getSelectedHero();
      await this.startTournament();
    });
  }

  initPlayerHealth() {
    this.playerHealth.setOnHealthChanged((status) => {
      this.updatePlayerHealthDisplay(status);
    });
    
    this.playerHealth.setOnGameOver(() => {
      this.handleGameOver();
    });
    
    this.playerHealth.init();
    
    this.updatePlayerHealthDisplay(this.playerHealth.getHealthStatus());
  }

  updatePlayerHealthDisplay(status) {
    const healthDisplay = document.getElementById('player-health-display');
    if (healthDisplay) {
      healthDisplay.innerHTML = `
        <div class="player-health-bar">
          <div class="player-health-fill" style="width: ${status.percentage}%"></div>
          <span class="player-health-text">Player HP: ${status.current}/${status.max}</span>
        </div>
        ${status.consecutiveLosses > 0 ? `<div class="loss-streak">Loss Streak: ${status.consecutiveLosses} (Next loss: -${status.nextLossAmount} HP)</div>` : ''}
      `;
    }
  }

  handleGameOver() {
    alert('Game Over! Your player health reached 0. Starting a new game...');
    this.playerHealth.reset();
    this.switchScreen('hero-selection');
  }

  initRounds() {
    const roundsContainer = document.getElementById('rounds-screen');
    this.rounds = new RoundsManager(roundsContainer, this.playerHealth, this.heroStatsCard);
    
    this.rounds.setOnTournamentEnd((result) => {
      if (result === 'back') {
        this.switchScreen('hero-selection');
      } else if (result && result.name) {
        const heroName = result.hero && result.hero.name ? result.hero.name : 'Unknown Hero';
        alert(`Tournament Winner: ${result.name} with ${heroName}!`);
        setTimeout(() => {
          this.switchScreen('hero-selection');
        }, 3000);
      }
    });

  }

  initHeroStatsCard() {
    this.heroStatsCard.init();
  }

  async startTournament() {
    try {
      if (this.heroSelection && this.heroSelection.timer) {
        this.heroSelection.timer.stopTimer();
      }

      const tournamentName = `Tournament ${Date.now()}`;
      const tournamentResponse = await apiClient.createTournament(tournamentName);
      
      const joinResponse = await apiClient.joinTournament(
        tournamentResponse.tournament.id, 
        this.selectedHero.id
      );

      this.currentTournament = tournamentResponse.tournament;
      
      if (this.socket) {
        apiClient.joinTournamentRoom(this.currentTournament.id);
      }

      this.switchScreen('rounds-screen');
      this.rounds.init(this.selectedHero, this.currentTournament);
      this.heroStatsCard.updateHero(this.selectedHero);
      
    } catch (error) {
      console.error('Failed to start tournament:', error);
      alert('Failed to start tournament: ' + error.message);
    }
  }

  switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.add('active');
      this.currentScreen = screenId;
    }
  }
}

const originalSetTimeout = window.setTimeout;
const originalSetInterval = window.setInterval;
const originalAddEventListener = EventTarget.prototype.addEventListener;

window.setTimeout = function(callback, delay, ...args) {
  const wrappedCallback = function() {
    try {
      return callback.apply(this, arguments);
    } catch (error) {
      console.error('=== SETTIMEOUT ERROR CAUGHT ===');
      console.error('Error in setTimeout callback:', error);
      console.error('Stack trace:', error.stack);
      if (error.message && error.message.includes("Cannot read properties of undefined (reading 'name')")) {
        console.error('=== TARGET TYPEERROR IN SETTIMEOUT ===');
        console.error('Callback function:', callback);
        console.error('Arguments:', arguments);
      }
      throw error;
    }
  };
  return originalSetTimeout.call(this, wrappedCallback, delay, ...args);
};

window.setInterval = function(callback, delay, ...args) {
  const wrappedCallback = function() {
    try {
      return callback.apply(this, arguments);
    } catch (error) {
      console.error('=== SETINTERVAL ERROR CAUGHT ===');
      console.error('Error in setInterval callback:', error);
      console.error('Stack trace:', error.stack);
      if (error.message && error.message.includes("Cannot read properties of undefined (reading 'name')")) {
        console.error('=== TARGET TYPEERROR IN SETINTERVAL ===');
        console.error('Callback function:', callback);
        console.error('Arguments:', arguments);
      }
      throw error;
    }
  };
  return originalSetInterval.call(this, wrappedCallback, delay, ...args);
};

EventTarget.prototype.addEventListener = function(type, listener, options) {
  const wrappedListener = function(event) {
    try {
      return listener.call(this, event);
    } catch (error) {
      console.error('=== EVENT LISTENER ERROR CAUGHT ===');
      console.error('Error in event listener:', error);
      console.error('Event type:', type);
      console.error('Stack trace:', error.stack);
      if (error.message && error.message.includes("Cannot read properties of undefined (reading 'name')")) {
        console.error('=== TARGET TYPEERROR IN EVENT LISTENER ===');
        console.error('Listener function:', listener);
        console.error('Event object:', event);
      }
      throw error;
    }
  };
  return originalAddEventListener.call(this, type, wrappedListener, options);
};

window.addEventListener('error', (event) => {
  console.error('=== ENHANCED GLOBAL ERROR CAUGHT ===');
  console.error('Error object:', event.error);
  console.error('Error message:', event.message);
  console.error('Error filename:', event.filename);
  console.error('Error line:', event.lineno);
  console.error('Error column:', event.colno);
  console.error('Full stack trace:', event.error?.stack);
  
  if (event.error?.stack) {
    const stackLines = event.error.stack.split('\n');
    console.error('=== PARSED STACK TRACE ===');
    stackLines.forEach((line, index) => {
      console.error(`Stack ${index}: ${line}`);
    });
  }
  
  if (event.message && event.message.includes("Cannot read properties of undefined (reading 'name')")) {
    console.error('=== THIS IS THE TARGET TYPEERROR ===');
    console.error('Stack trace for name access error:', event.error?.stack);
    console.error('Current game state when error occurred:');
    console.error('- Current screen:', document.querySelector('.screen:not([style*="display: none"])'));
    console.error('- Tournament state:', window.game?.currentTournament);
    console.error('- Rounds manager players:', window.game?.rounds?.players);
    console.error('- Active timers:', window.game?.rounds?.timer);
    
    if (event.error?.stack) {
      const stackLines = event.error.stack.split('\n');
      const relevantLine = stackLines.find(line => 
        line.includes('localhost:3000') && 
        !line.includes('main.js') && 
        (line.includes('.js:') || line.includes('.html:'))
      );
      if (relevantLine) {
        console.error('=== MOST LIKELY SOURCE OF ERROR ===');
        console.error('Source line:', relevantLine);
      }
    }
    
    event.preventDefault();
    return false;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('=== UNHANDLED PROMISE REJECTION ===');
  console.error('Reason:', event.reason);
  console.error('Promise:', event.promise);
  if (event.reason?.stack) {
    console.error('Promise rejection stack:', event.reason.stack);
  }
});

const originalConsoleError = console.error;
console.error = function(...args) {
  if (args.length > 0 && typeof args[0] === 'string' && args[0].includes("Cannot read properties of undefined (reading 'name')")) {
    console.log('=== CONSOLE.ERROR INTERCEPTED TARGET ERROR ===');
    console.log('Arguments:', args);
    console.log('Stack trace at console.error call:', new Error().stack);
  }
  return originalConsoleError.apply(console, args);
};

document.addEventListener('DOMContentLoaded', () => {
  window.game = new AutoGladiators();
});

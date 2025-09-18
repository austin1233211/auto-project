import { GameModeSelection } from '../ui/game-mode-selection.js';
import { HeroSelection } from '../ui/hero-selection.js';
import { PlayerHealth } from '../ui/player-health.js';
import { RoundsManager } from '../systems/rounds-manager.js';
import { HeroStatsCard } from '../ui/hero-stats-card.js';
import { MultiplayerLobby } from '../../multiplayer/multiplayer-lobby.js';
import { MultiplayerTournament } from '../../multiplayer/multiplayer-tournament.js';
import { heroes } from '../core/heroes.js';

console.log('MAIN_BOOT');
class AutoGladiators {
  constructor() {
    this.currentScreen = 'game-mode-selection';
    this.selectedHero = null;
    this.selectedMode = null;
    this.playerHealth = new PlayerHealth();
    this.heroStatsCard = new HeroStatsCard();
    this.init();
  }

  init() {
    this.initGameModeSelection();
    this.initHeroSelection();
    this.initPlayerHealth();
    this.initRounds();
    this.initHeroStatsCard();
    this.multiplayerLobbyInitialized = false;
  }

  initGameModeSelection() {
    const gameModeContainer = document.getElementById('game-mode-selection');
    const gameModeSelection = new GameModeSelection(gameModeContainer);

    gameModeSelection.setOnModeSelected((mode) => {
      this.selectedMode = mode;
      if (mode.id === 'multiplayer') {
        this.switchScreen('multiplayer-lobby');
        if (!this.multiplayerLobbyInitialized) {
          this.initMultiplayerLobby();
        }
      } else if (mode.id === 'multiplayer-tournament') {
        this.switchScreen('multiplayer-tournament');
        if (!this.multiplayerTournamentInitialized) {
          this.initMultiplayerTournament();
        }
      } else {
        this.switchScreen('hero-selection');
      }
    });
  }

  initHeroSelection() {
    const heroSelectionContainer = document.getElementById('hero-selection');
    this.heroSelection = new HeroSelection(heroSelectionContainer);

    this.heroSelection.setOnTournamentStart(() => {
      this.selectedHero = this.heroSelection.getSelectedHero();
      this.startTournament();
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
        alert(`Tournament Winner: ${result.name} with ${result.hero.name}!`);
        setTimeout(() => {
          this.switchScreen('hero-selection');
        }, 3000);
      }
    });

  }

  initHeroStatsCard() {
    this.heroStatsCard.init();
  }

  initMultiplayerLobby() {
    const lobbyContainer = document.getElementById('multiplayer-lobby');
    if (this.multiplayerLobbyInitialized) return;
    const lobby = new MultiplayerLobby(lobbyContainer, ({ me, opponent }) => {
      const myHero = heroes.find(h => h.id === (me.hero && me.hero.id ? me.hero.id : me.heroId || me.hero));
      const oppHero = heroes.find(h => h.id === (opponent.hero && opponent.hero.id ? opponent.hero.id : opponent.heroId || opponent.hero));
      const roundsContainer = document.getElementById('rounds-screen');
      this.switchScreen('rounds-screen');
      const rm = new RoundsManager(roundsContainer, this.playerHealth, this.heroStatsCard);
      rm.players = [
        { id: 1, name: 'You', hero: myHero, playerHealth: this.playerHealth, isEliminated: false, wins:0, losses:0, gold:300, consecutiveWins:0, consecutiveLosses:0 },
        { id: 2, name: opponent.name || 'Opponent', hero: oppHero, playerHealth: new PlayerHealth(), isEliminated: false, wins:0, losses:0, gold:300, consecutiveWins:0, consecutiveLosses:0 }
      ];
      rm.activePlayers = [...rm.players];
      rm.ghostPlayers = [];
      rm.currentRound = 1;
      rm.render();
      rm.startBattle(rm.players[0], rm.players[1]);
      rm.combat.setOnBattleEnd((result) => {
        rm.endBattle(result, rm.players[0], rm.players[1]);
        setTimeout(() => {
          this.switchScreen('game-mode-selection');
        }, 3000);
      });
    });
    lobby.init();
    this.multiplayerLobbyInitialized = true;
  }

  initMultiplayerTournament() {
    const container = document.getElementById('multiplayer-tournament');
    if (this.multiplayerTournamentInitialized) return;
    const mt = new MultiplayerTournament(container, () => {
      this.switchScreen('game-mode-selection');
    });
    mt.init();
    this.multiplayerTournamentInitialized = true;
  }

  startTournament() {
    if (this.heroSelection && this.heroSelection.timer) {
      this.heroSelection.timer.stopTimer();
    }
    this.switchScreen('rounds-screen');
    this.rounds.init(this.selectedHero);
    this.heroStatsCard.updateHero(this.selectedHero);
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

    const hpEl = document.getElementById('player-health-display');
    if (hpEl) {
      hpEl.style.display = screenId === 'rounds-screen' ? 'block' : 'none';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AutoGladiators();
});

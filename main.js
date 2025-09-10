import { GameModeSelection } from './game-mode-selection.js';
import { HeroSelection } from './hero-selection.js';
import { PlayerHealth } from './player-health.js';
import { RoundsManager } from './rounds-manager.js';
import { ItemShop } from './item-shop.js';

class AutoGladiators {
  constructor() {
    this.currentScreen = 'game-mode-selection';
    this.selectedHero = null;
    this.selectedMode = null;
    this.playerHealth = new PlayerHealth();
    this.init();
  }

  init() {
    this.initGameModeSelection();
    this.initHeroSelection();
    this.initPlayerHealth();
    this.initRounds();
    this.initItemShop();
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
    const heroSelection = new HeroSelection(heroSelectionContainer);

    heroSelection.setOnTournamentStart(() => {
      this.selectedHero = heroSelection.getSelectedHero();
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
    this.rounds = new RoundsManager(roundsContainer, this.playerHealth);
    
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

    this.rounds.setOnItemShop(() => {
      const userPlayer = this.rounds.players.find(p => p.name === "You");
      this.switchScreen('shop-screen');
      this.itemShop.setPlayerMoney(userPlayer ? userPlayer.money : 0);
      this.itemShop.init();
    });
  }

  initItemShop() {
    const shopContainer = document.getElementById('shop-screen');
    this.itemShop = new ItemShop(shopContainer);
    
    this.itemShop.setOnShopComplete((purchasedItems) => {
      const userPlayer = this.rounds.players.find(p => p.name === "You");
      if (userPlayer) {
        if (purchasedItems.length > 0) {
          userPlayer.hero = this.itemShop.applyItemsToHero(userPlayer.hero);
        }
        userPlayer.money = this.itemShop.playerMoney;
      }
      
      this.switchScreen('rounds-screen');
      this.rounds.continueAfterItemShop();
    });
  }

  startTournament() {
    this.switchScreen('rounds-screen');
    this.rounds.init(this.selectedHero);
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

document.addEventListener('DOMContentLoaded', () => {
  new AutoGladiators();
});

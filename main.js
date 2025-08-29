import { HeroSelection } from './hero-selection.js';
import { Combat } from './combat.js';
import { PlayerHealth } from './player-health.js';

class AutoGladiators {
  constructor() {
    this.currentScreen = 'hero-selection';
    this.selectedHero = null;
    this.playerHealth = new PlayerHealth();
    this.init();
  }

  init() {
    this.initHeroSelection();
    this.initCombat();
    this.initPlayerHealth();
  }

  initHeroSelection() {
    const heroSelectionContainer = document.getElementById('hero-selection');
    const heroSelection = new HeroSelection(heroSelectionContainer);
    
    heroSelection.setOnHeroSelected((hero) => {
      this.selectedHero = hero;
      console.log('Selected hero:', hero);
      this.startCombat(hero);
    });
  }

  initCombat() {
    const combatContainer = document.getElementById('combat-screen');
    this.combat = new Combat(combatContainer);
    
    this.combat.setOnBattleEnd((result) => {
      if (result === 'back') {
        this.switchScreen('hero-selection');
      } else {
        this.playerHealth.processRoundResult(result);
        setTimeout(() => {
          this.switchScreen('hero-selection');
        }, 2000);
      }
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

  startCombat(hero) {
    this.switchScreen('combat-screen');
    this.combat.init(hero);
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

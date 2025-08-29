import { HeroSelection } from './hero-selection.js';
import { Combat } from './combat.js';

class AutoGladiators {
  constructor() {
    this.currentScreen = 'hero-selection';
    this.selectedHero = null;
    this.init();
  }

  init() {
    this.initHeroSelection();
    this.initCombat();
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
        setTimeout(() => {
          this.switchScreen('hero-selection');
        }, 2000);
      }
    });
  }

  startCombat(hero) {
    this.switchScreen('combat-screen');
    this.combat.init(hero);
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

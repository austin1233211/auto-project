import { HeroSelection } from './hero-selection.js';

class AutoGladiators {
  constructor() {
    this.currentScreen = 'hero-selection';
    this.selectedHero = null;
    this.init();
  }

  init() {
    this.initHeroSelection();
  }

  initHeroSelection() {
    const heroSelectionContainer = document.getElementById('hero-selection');
    const heroSelection = new HeroSelection(heroSelectionContainer);
    
    heroSelection.setOnHeroSelected((hero) => {
      this.selectedHero = hero;
      console.log('Selected hero:', hero);
      alert(`You selected ${hero.name}! Combat system coming next...`);
    });
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

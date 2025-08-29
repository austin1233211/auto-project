import { heroes } from './heroes.js';

export class HeroSelection {
  constructor(container) {
    this.container = container;
    this.selectedHero = null;
    this.onHeroSelected = null;
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="hero-selection-container">
        <h1 class="hero-selection-title">Choose Your Gladiator</h1>
        
        <div class="heroes-grid">
          ${heroes.map(hero => this.renderHeroCard(hero)).join('')}
        </div>
        
        <div class="hero-details empty">
          <p>Select a hero to view details</p>
        </div>
        
        <button class="start-button" id="start-game-btn">
          Start Battle
        </button>
      </div>
    `;
  }

  renderHeroCard(hero) {
    return `
      <div class="hero-card" data-hero-id="${hero.id}">
        <div class="hero-avatar">${hero.avatar}</div>
        <div class="hero-name">${hero.name}</div>
        <div class="hero-type">${hero.type}</div>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-label">HP</span>
            <span class="stat-value">${hero.stats.health}</span>
          </div>
          <div class="stat">
            <span class="stat-label">ATK</span>
            <span class="stat-value">${hero.stats.attack}</span>
          </div>
          <div class="stat">
            <span class="stat-label">ARM</span>
            <span class="stat-value">${hero.stats.armor}</span>
          </div>
          <div class="stat">
            <span class="stat-label">SPD</span>
            <span class="stat-value">${hero.stats.speed}</span>
          </div>
        </div>
      </div>
    `;
  }

  renderHeroDetails(hero) {
    return `
      <div class="selected-hero-name">${hero.name}</div>
      <div class="selected-hero-description">${hero.description}</div>
      <div class="selected-hero-abilities">
        ${hero.abilities.map(ability => `
          <div class="ability">
            <div class="ability-name">${ability.name}</div>
            <div class="ability-description">${ability.description}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  attachEventListeners() {
    this.container.addEventListener('click', (e) => {
      const heroCard = e.target.closest('.hero-card');
      if (heroCard) {
        const heroId = heroCard.dataset.heroId;
        this.selectHero(heroId);
      }
    });

    const startBtn = this.container.querySelector('#start-game-btn');
    startBtn.addEventListener('click', () => {
      if (this.selectedHero && this.onHeroSelected) {
        this.onHeroSelected(this.selectedHero);
      }
    });
  }

  selectHero(heroId) {
    const previousSelected = this.container.querySelector('.hero-card.selected');
    if (previousSelected) {
      previousSelected.classList.remove('selected');
    }

    const heroCard = this.container.querySelector(`[data-hero-id="${heroId}"]`);
    heroCard.classList.add('selected');

    this.selectedHero = heroes.find(hero => hero.id === heroId);

    const detailsContainer = this.container.querySelector('.hero-details');
    detailsContainer.classList.remove('empty');
    detailsContainer.innerHTML = this.renderHeroDetails(this.selectedHero);

    const startBtn = this.container.querySelector('#start-game-btn');
    startBtn.classList.add('enabled');
  }

  getSelectedHero() {
    return this.selectedHero;
  }

  setOnHeroSelected(callback) {
    this.onHeroSelected = callback;
  }
}

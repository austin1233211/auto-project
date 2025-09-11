import { StatsCalculator } from './stats-calculator.js';

export class HeroStatsCard {
  constructor() {
    this.container = null;
    this.currentHero = null;
    this.isVisible = false;
  }

  init() {
    this.createContainer();
    this.attachToDOM();
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'hero-stats-card';
    this.container.className = 'hero-stats-card';
  }

  attachToDOM() {
    document.body.appendChild(this.container);
  }

  updateHero(hero) {
    if (!hero) {
      this.hide();
      return;
    }

    this.currentHero = hero;
    this.render();
    this.show();
  }

  render() {
    if (!this.currentHero) return;

    const processedHero = StatsCalculator.processHeroStats(this.currentHero);
    const stats = processedHero.effectiveStats;

    this.container.innerHTML = `
      <div class="hero-stats-card-content">
        <div class="hero-stats-header">
          <div class="hero-avatar-mini">${this.currentHero.avatar}</div>
          <div class="hero-name-mini">${this.currentHero.name}</div>
        </div>
        <div class="hero-stats-grid">
          <div class="stat-item">
            <span class="stat-label">❤️ HP</span>
            <span class="stat-value">${Math.round(this.currentHero.currentHealth || stats.health)}/${stats.health}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">⚔️ ATK</span>
            <span class="stat-value">${Math.round(stats.attack)}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">💨 SPD</span>
            <span class="stat-value">${stats.speed.toFixed(2)}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">🛡️ ARM</span>
            <span class="stat-value">${stats.armor}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">💥 CRIT</span>
            <span class="stat-value">${(stats.critChance * 100).toFixed(1)}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">👻 EVA</span>
            <span class="stat-value">${(stats.evasionChance * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    `;
  }

  show() {
    if (this.container) {
      this.container.style.display = 'block';
      this.isVisible = true;
    }
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
      this.isVisible = false;
    }
  }

  refresh() {
    if (this.currentHero && this.isVisible) {
      this.render();
    }
  }
}

import { Timer } from './timer.js';

export class HeroSelection {
  constructor(container) {
    this.container = container;
    this.selectedHero = null;
    this.onHeroSelected = null;
    this.displayedHeroes = [];
    this.allHeroes = [];
    this.timer = new Timer();
    this.timerActive = false;
    this.setupTimer();
    this.init();
  }

  async init() {
    await this.loadHeroes();
    this.render();
    this.attachEventListeners();
    this.startSelectionTimer();
  }

  async loadHeroes() {
    try {
      const response = await apiClient.getHeroes();
      this.allHeroes = response.heroes.map(hero => ({
        id: hero.id,
        name: hero.name,
        class: hero.class,
        type: hero.class,
        avatar: hero.avatar,
        description: `A ${hero.class} warrior with balanced combat abilities.`,
        stats: {
          health: hero.stats.health,
          attack: hero.stats.attack,
          armor: hero.stats.armor,
          speed: hero.stats.speed,
          critChance: hero.stats.critChance,
          evasionChance: hero.stats.evasionChance
        },
        abilities: {
          passive: {
            name: hero.passiveAbility.name,
            description: hero.passiveAbility.description
          },
          ultimate: {
            name: hero.ultimateAbility.name,
            description: hero.ultimateAbility.description
          }
        }
      }));
    } catch (error) {
      console.error('Failed to load heroes:', error);
      this.allHeroes = [];
    }
  }

  getHeroAvatar(heroClass) {
    const avatars = {
      'Warrior': '⚔️',
      'Mage': '🔮',
      'Archer': '🏹',
      'Assassin': '🗡️',
      'Paladin': '🛡️',
      'Berserker': '🪓',
      'Necromancer': '💀',
      'Druid': '🌿'
    };
    return avatars[heroClass] || '⚔️';
  }

  render() {
    this.displayedHeroes = this.getRandomHeroes(3);
    
    this.container.innerHTML = `
      <div class="hero-selection-container">
        <h1 class="hero-selection-title">Choose Your Gladiator</h1>
        
        <div id="selection-timer" class="selection-timer">
          <div class="timer-display">Selection Time: 0:50</div>
        </div>
        
        <div class="heroes-grid">
          ${this.displayedHeroes.map((hero, index) => this.renderHeroCard(hero, index)).join('')}
        </div>
        
        <div class="hero-details empty">
          <p>Select a hero to view details</p>
        </div>
        
        <button class="start-button tournament-btn" id="start-tournament-btn">
          Start Tournament (8 Players)
        </button>
      </div>
    `;
  }

  renderHeroCard(hero, displayIndex) {
    return `
      <div class="hero-card" data-hero-id="${hero.id}" data-display-index="${displayIndex}">
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
          <div class="stat">
            <span class="stat-label">CRIT</span>
            <span class="stat-value">${(hero.stats.critChance * 100).toFixed(1)}%</span>
          </div>
          <div class="stat">
            <span class="stat-label">EVA</span>
            <span class="stat-value">${(hero.stats.evasionChance * 100).toFixed(1)}%</span>
          </div>
        </div>
        <button class="reroll-btn" data-display-index="${displayIndex}" 
                ${hero.hasBeenRerolled ? 'disabled' : ''}>
          ${hero.hasBeenRerolled ? 'Re-rolled' : 'Re-roll'}
        </button>
      </div>
    `;
  }

  renderHeroDetails(hero) {
    if (!hero) {
      console.error('renderHeroDetails called with undefined hero');
      return '<div class="error">Hero data not available</div>';
    }
    
    if (!hero.name) {
      console.error('Hero object missing name property:', hero);
      return '<div class="error">Hero name not available</div>';
    }
    
    return `
      <div class="selected-hero-name">${hero.name}</div>
      <div class="selected-hero-description">${hero.description || 'No description available'}</div>
      <div class="selected-hero-abilities">
        <div class="ability">
          <div class="ability-name">Passive: ${hero.abilities?.passive?.name || 'Unknown'}</div>
          <div class="ability-description">${hero.abilities?.passive?.description || 'No description'}</div>
        </div>
        <div class="ability">
          <div class="ability-name">Ultimate: ${hero.abilities?.ultimate?.name || 'Unknown'}</div>
          <div class="ability-description">${hero.abilities?.ultimate?.description || 'No description'}</div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    this.reattachHeroCardListeners();

    const tournamentBtn = this.container.querySelector('#start-tournament-btn');
    tournamentBtn.addEventListener('click', () => {
      if (this.selectedHero) {
        this.timer.stopTimer();
        this.timerActive = false;
        if (this.onTournamentStart) {
          this.onTournamentStart();
        }
      }
    });
  }

  selectHero(heroId) {
    console.log('=== HERO SELECTION DEBUG ===');
    console.log('Selecting hero with ID:', heroId);
    console.log('Available heroes:', this.displayedHeroes.map(h => ({ id: h.id, name: h.name })));
    
    const previousSelected = this.container.querySelector('.hero-card.selected');
    if (previousSelected) {
      previousSelected.classList.remove('selected');
    }

    const heroCard = this.container.querySelector(`[data-hero-id="${heroId}"]`);
    if (!heroCard) {
      console.error('Hero card not found for ID:', heroId);
      return;
    }
    heroCard.classList.add('selected');

    this.selectedHero = this.displayedHeroes.find(hero => hero.id === heroId);
    
    if (!this.selectedHero) {
      console.error('Hero not found in displayedHeroes for ID:', heroId);
      console.error('Available hero IDs:', this.displayedHeroes.map(h => h.id));
      return;
    }
    
    console.log('Selected hero:', this.selectedHero);

    const detailsContainer = this.container.querySelector('.hero-details');
    detailsContainer.classList.remove('empty');
    detailsContainer.innerHTML = this.renderHeroDetails(this.selectedHero);

    const tournamentBtn = this.container.querySelector('#start-tournament-btn');
    tournamentBtn.classList.add('enabled');
    tournamentBtn.textContent = 'Start Tournament';
    
    if (this.timerActive) {
      this.timer.stopTimer();
      this.timerActive = false;
      const timerElement = this.container.querySelector('#selection-timer');
      if (timerElement) {
        timerElement.style.display = 'none';
      }
    }
  }

  getSelectedHero() {
    return this.selectedHero;
  }

  setOnTournamentStart(callback) {
    this.onTournamentStart = callback;
  }

  getRandomHeroes(count) {
    const shuffled = [...this.allHeroes].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map((hero, index) => ({
      ...hero,
      displayIndex: index,
      hasBeenRerolled: false
    }));
  }

  rerollHero(displayIndex) {
    if (this.displayedHeroes[displayIndex].hasBeenRerolled) {
      return;
    }

    const currentHeroIds = this.displayedHeroes.map(h => h.id);
    
    const availableHeroes = this.allHeroes.filter(hero => !currentHeroIds.includes(hero.id));
    
    if (availableHeroes.length > 0) {
      const randomHero = availableHeroes[Math.floor(Math.random() * availableHeroes.length)];
      this.displayedHeroes[displayIndex] = {
        ...randomHero,
        displayIndex: displayIndex,
        hasBeenRerolled: true
      };
      
      this.updateHeroCard(displayIndex);
    }
  }

  updateHeroCard(displayIndex) {
    const heroCard = this.container.querySelector(`[data-display-index="${displayIndex}"]`);
    if (heroCard) {
      heroCard.outerHTML = this.renderHeroCard(this.displayedHeroes[displayIndex], displayIndex);
      this.reattachHeroCardListeners();
    }
  }

  reattachHeroCardListeners() {
    this.container.removeEventListener('click', this.heroClickHandler);
    this.heroClickHandler = (e) => {
      const heroCard = e.target.closest('.hero-card');
      const rerollBtn = e.target.closest('.reroll-btn');
      
      if (rerollBtn) {
        e.stopPropagation();
        const displayIndex = parseInt(rerollBtn.dataset.displayIndex);
        this.rerollHero(displayIndex);
      } else if (heroCard) {
        const heroId = heroCard.dataset.heroId;
        this.selectHero(heroId);
      }
    };
    this.container.addEventListener('click', this.heroClickHandler);
  }

  setupTimer() {
    this.timer.setOnTimerUpdate((timerData) => {
      this.updateTimerDisplay(timerData);
    });

    this.timer.setOnRoundEnd(() => {
      this.handleTimerExpired();
    });
  }

  startSelectionTimer() {
    this.timerActive = true;
    const timerElement = this.container.querySelector('#selection-timer');
    if (timerElement) {
      timerElement.style.display = 'block';
    }
    this.timer.startRound();
  }

  updateTimerDisplay(timerData) {
    const timerElement = this.container.querySelector('#selection-timer .timer-display');
    if (timerElement) {
      const minutes = Math.floor(timerData.time / 60);
      const seconds = timerData.time % 60;
      const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      timerElement.textContent = `Selection Time: ${timeString}`;
    }
  }

  handleTimerExpired() {
    if (!this.selectedHero && this.timerActive) {
      const randomIndex = Math.floor(Math.random() * this.displayedHeroes.length);
      this.selectHero(this.displayedHeroes[randomIndex].id);
      
      const notification = document.createElement('div');
      notification.className = 'auto-select-notification';
      notification.textContent = 'Time expired! Hero auto-selected.';
      this.container.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
      
      if (this.onTournamentStart) {
        setTimeout(() => {
          this.onTournamentStart();
        }, 1000);
      }
    }
    this.timerActive = false;
  }
}

export class GameModeSelection {
  constructor(container) {
    this.container = container;
    this.selectedMode = null;
    this.onModeSelected = null;
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-mode-selection-container">
        <h1 class="game-mode-selection-title">Choose Game Mode</h1>
        
        <div class="game-modes-grid">
          ${this.renderGameModeCard('casual', '⚔️', 'Single Player', 'Play tournament vs AI opponents', true)}
          ${this.renderGameModeCard('multiplayer', '👥', 'Multiplayer (1v1)', 'Play against a real player', true)}
          ${this.renderGameModeCard('multiplayer-tournament', '👥', 'Multiplayer Tournament', '8 players, synchronized rounds', true)}
          ${this.renderGameModeCard('ranked', '🏆', 'Ranked', 'Competitive matches (coming soon)', false)}
          ${this.renderGameModeCard('practice', '🎯', 'Practice', 'Train against AI opponents (coming soon)', false)}
        </div>
        
        <div class="game-mode-details empty">
          <p>Select a game mode to view details</p>
        </div>
        
        <button class="start-button play-btn" id="start-play-btn">
          Play
        </button>
      </div>
    `;
  }

  renderGameModeCard(id, icon, name, description, enabled) {
    const disabledClass = enabled ? '' : ' disabled';
    const comingSoonText = enabled ? '' : '<div class="coming-soon">Coming Soon</div>';
    
    return `
      <div class="game-mode-card${disabledClass}" data-mode-id="${id}">
        <div class="game-mode-icon">${icon}</div>
        <div class="game-mode-name">${name}</div>
        <div class="game-mode-description">${description}</div>
        ${comingSoonText}
      </div>
    `;
  }

  renderGameModeDetails(mode) {
    const modeDetails = {
      casual: {
        name: 'Casual Mode',
        description: 'Perfect for learning the game mechanics and trying different strategies without pressure.',
        features: ['No ranking system', 'Relaxed gameplay', 'Great for beginners']
      },
      'multiplayer': {
        name: 'Multiplayer (1v1)',
        description: 'Face off against a single real opponent.',
        features: ['Head-to-head battles', 'Quick matchmaking']
      },
      'multiplayer-tournament': {
        name: 'Multiplayer Tournament',
        description: '8 real players in synchronized rounds. Server-coordinated matches and timers.',
        features: ['8-player lobby', 'Synchronized rounds', 'Server-driven pairings']
      }
    };

    const details = modeDetails[mode.id] || {
      name: 'Mode',
      description: 'Play this mode.',
      features: []
    };
    return `
      <div class="selected-mode-name">${details.name}</div>
      <div class="selected-mode-description">${details.description}</div>
      <div class="selected-mode-features">
        ${details.features.map(feature => `
          <div class="feature">
            <span class="feature-text">${feature}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  attachEventListeners() {
    this.container.addEventListener('click', (e) => {
      const modeCard = e.target.closest('.game-mode-card');
      if (modeCard && !modeCard.classList.contains('disabled')) {
        const modeId = modeCard.dataset.modeId;
        this.selectMode(modeId);
      }
    });

    const playBtn = this.container.querySelector('#start-play-btn');
    playBtn.addEventListener('click', () => {
      if (this.onModeSelected && this.selectedMode) {
        this.onModeSelected(this.selectedMode);
      }
    });
  }

  selectMode(modeId) {
    const previousSelected = this.container.querySelector('.game-mode-card.selected');
    if (previousSelected) {
      previousSelected.classList.remove('selected');
    }

    const modeCard = this.container.querySelector(`[data-mode-id="${modeId}"]`);
    modeCard.classList.add('selected');

    this.selectedMode = { id: modeId };

    const detailsContainer = this.container.querySelector('.game-mode-details');
    detailsContainer.classList.remove('empty');
    detailsContainer.innerHTML = this.renderGameModeDetails(this.selectedMode);

    const playBtn = this.container.querySelector('#start-play-btn');
    playBtn.classList.add('enabled');
  }

  getSelectedMode() {
    return this.selectedMode;
  }

  setOnModeSelected(callback) {
    this.onModeSelected = callback;
  }
}

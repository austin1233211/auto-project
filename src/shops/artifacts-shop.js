import { ArtifactSystem } from '../core/artifacts.js';
import { sanitizeHTML } from '../utils/sanitize.js';

export class ArtifactsShop {
  constructor(container, roundNumber, players = null) {
    this.container = container;
    this.roundNumber = roundNumber;
    this.players = players;
    this.artifactSystem = new ArtifactSystem();
    this.currentArtifacts = [];
    this.hasRerolled = false;
    this.onArtifactSelected = null;
    this.selectedArtifact = null;
  }

  init() {
    this.generateArtifacts();
    this.render();
    this.attachEventListeners();
  }

  generateArtifacts() {
    this.currentArtifacts = this.artifactSystem.selectRandomArtifacts(this.roundNumber, 3);
  }

  render() {
    this.container.innerHTML = `
      <div class="artifacts-shop">
        <div class="shop-header">
          <h2>🏺 Artifact Selection - Round ${this.roundNumber}</h2>
          <p>Choose one powerful artifact to aid you in battle</p>
        </div>
        
        <div class="artifacts-grid">
          ${this.currentArtifacts.map((artifact, index) => `
            <div class="artifact-slot" data-index="${index}">
              <div class="artifact-info">
                <div class="artifact-header">
                  <span class="artifact-emoji">${artifact.emoji}</span>
                  <span class="artifact-name">${artifact.name}</span>
                </div>
                <div class="artifact-description">${artifact.description}</div>
                <div class="artifact-footer">
                  <span class="artifact-cost">✨ Free</span>
                </div>
              </div>
              <button class="select-artifact-button" data-index="${index}">
                Select Artifact
              </button>
            </div>
          `).join('')}
        </div>
        
        <div class="shop-actions">
          <button class="reroll-button" ${this.hasRerolled ? 'disabled' : ''}>
            🎲 Re-roll Artifacts ${this.hasRerolled ? '(Used)' : ''}
          </button>
          <button class="confirm-selection-button" ${this.selectedArtifact ? '' : 'disabled'}>
            Confirm Selection
          </button>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const rerollButton = this.container.querySelector('.reroll-button');
    const confirmButton = this.container.querySelector('.confirm-selection-button');
    const selectButtons = this.container.querySelectorAll('.select-artifact-button');

    if (rerollButton && !this.hasRerolled) {
      rerollButton.addEventListener('click', () => {
        this.rerollArtifacts();
      });
    }

    if (confirmButton) {
      confirmButton.addEventListener('click', () => {
        this.confirmSelection();
      });
    }

    selectButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.selectArtifact(index);
      });
    });
  }

  selectArtifact(index) {
    this.selectedArtifact = this.currentArtifacts[index];
    
    this.container.querySelectorAll('.artifact-slot').forEach((slot, i) => {
      if (i === index) {
        slot.classList.add('selected');
      } else {
        slot.classList.remove('selected');
      }
    });

    const confirmButton = this.container.querySelector('.confirm-selection-button');
    if (confirmButton) {
      confirmButton.disabled = false;
    }
  }

  rerollArtifacts() {
    if (this.hasRerolled) return;
    
    this.hasRerolled = true;
    this.selectedArtifact = null;
    this.generateArtifacts();
    this.render();
    this.attachEventListeners();
  }

  confirmSelection() {
    if (this.selectedArtifact && this.onArtifactSelected) {
      if (this.selectedArtifact.effect === 'parasite') {
        this.showParasitePlayerSelection();
      } else {
        this.onArtifactSelected(this.selectedArtifact);
      }
    }
  }

  showParasitePlayerSelection() {
    const overlay = document.createElement('div');
    overlay.className = 'parasite-selection-overlay';
    overlay.innerHTML = `
      <div class="parasite-selection-modal">
        <h2>🦠 Select Target Player</h2>
        <p>Choose a player to leech gold from. You'll earn 75 gold each time they win a battle!</p>
        <div class="parasite-player-list" id="parasite-player-list">
          <!-- Players will be injected here -->
        </div>
        <button class="cancel-button" id="parasite-cancel">Cancel</button>
      </div>
    `;
    document.body.appendChild(overlay);

    const playerListContainer = overlay.querySelector('#parasite-player-list');
    const cancelButton = overlay.querySelector('#parasite-cancel');

    if (this.players && Array.isArray(this.players)) {
      const otherPlayers = this.players.filter(p => p.name !== 'You');
      
      playerListContainer.innerHTML = otherPlayers.map(player => `
        <div class="parasite-player-option" data-player-id="${player.id}">
          <div class="player-avatar">${player.hero.avatar}</div>
          <div class="player-details">
            <div class="player-name">${sanitizeHTML(player.name)}</div>
            <div class="player-hero-name">${sanitizeHTML(player.hero.name)}</div>
          </div>
          <div class="player-stats-mini">
            <span>W: ${player.wins || 0}</span>
            <span>HP: ${player.playerHealth?.currentHealth || 0}</span>
          </div>
        </div>
      `).join('');

      overlay.querySelectorAll('.parasite-player-option').forEach(option => {
        option.addEventListener('click', () => {
          const playerId = parseInt(option.dataset.playerId);
          this.selectedArtifact.parasiteTargetId = playerId;
          document.body.removeChild(overlay);
          this.onArtifactSelected(this.selectedArtifact);
        });
      });
    } else {
      playerListContainer.innerHTML = '<p class="no-players-message">No other players available</p>';
    }

    cancelButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
  }

  setOnArtifactSelected(callback) {
    this.onArtifactSelected = callback;
  }

  hide() {
    this.container.style.display = 'none';
  }

  show() {
    this.container.style.display = 'block';
  }
}

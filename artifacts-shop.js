import { ArtifactSystem } from './artifacts.js';

export class ArtifactsShop {
  constructor(container, roundNumber) {
    this.container = container;
    this.roundNumber = roundNumber;
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
      this.onArtifactSelected(this.selectedArtifact);
    }
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

export class MatchmakingManager {
  constructor(container) {
    this.container = container;
    this.isInMatchmaking = false;
    this.readyCheckActive = false;
    this.readyCheckTimer = null;
    this.readyCheckTimeLeft = 0;
    this.playerReady = false;
    this.onMatchmakingComplete = null;
    this.onMatchmakingCancelled = null;
  }

  startMatchmaking() {
    this.isInMatchmaking = true;
    this.render();
  }

  stopMatchmaking() {
    this.isInMatchmaking = false;
    this.endReadyCheck();
    this.render();
  }

  startReadyCheck(timeLimit = 10) {
    this.readyCheckActive = true;
    this.readyCheckTimeLeft = timeLimit;
    this.playerReady = false;
    
    this.render();
    
    this.readyCheckTimer = setInterval(() => {
      this.readyCheckTimeLeft--;
      
      if (this.readyCheckTimeLeft <= 0) {
        this.endReadyCheck();
        if (!this.playerReady) {
          this.showError('❌ You were removed from matchmaking for not readying up!');
          setTimeout(() => {
            if (this.onMatchmakingCancelled) {
              this.onMatchmakingCancelled('timeout');
            }
          }, 2000);
        }
      } else {
        this.updateReadyCheckDisplay();
      }
    }, 1000);
  }

  endReadyCheck() {
    this.readyCheckActive = false;
    this.playerReady = false;
    
    if (this.readyCheckTimer) {
      clearInterval(this.readyCheckTimer);
      this.readyCheckTimer = null;
    }
  }

  markPlayerReady() {
    if (!this.readyCheckActive || this.playerReady) return;
    
    this.playerReady = true;
    
    const readyBtn = this.container.querySelector('#ready-button');
    if (readyBtn) {
      readyBtn.textContent = '✅ READY';
      readyBtn.disabled = true;
      readyBtn.className = 'action-button success';
    }
    
    this.showMessage('✅ You are ready! Waiting for other players...');
    
    return true;
  }

  render() {
    if (!this.isInMatchmaking) {
      this.container.innerHTML = '';
      return;
    }

    this.container.innerHTML = `
      <div class="matchmaking-container">
        <h2>🔍 Matchmaking</h2>
        <div class="matchmaking-status">
          <div class="status-message" id="matchmaking-status">
            Looking for players...
          </div>
        </div>
        
        ${this.renderReadyCheck()}
        
        <div class="matchmaking-controls">
          <button class="action-button secondary" id="cancel-matchmaking">Cancel Matchmaking</button>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  renderReadyCheck() {
    if (!this.readyCheckActive) {
      return '';
    }

    return `
      <div class="ready-check-container">
        <div class="ready-check-header">
          <h2>🚨 Ready Check</h2>
          <div class="ready-timer">
            <span class="timer-text">${this.readyCheckTimeLeft}</span>
            <div class="timer-bar">
              <div class="timer-fill" style="width: ${(this.readyCheckTimeLeft / 10) * 100}%"></div>
            </div>
          </div>
        </div>
        
        <div class="ready-check-message">
          <p>All players found! Click READY to confirm you want to start the tournament.</p>
          <p class="warning-text">⚠️ You will be removed from matchmaking if you don't click ready in time!</p>
        </div>
        
        <div class="ready-check-controls">
          <button class="action-button ${this.playerReady ? 'success' : 'primary'}" id="ready-button" ${this.playerReady ? 'disabled' : ''}>
            ${this.playerReady ? '✅ READY' : '🎯 READY UP'}
          </button>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const cancelBtn = this.container.querySelector('#cancel-matchmaking');
    const readyBtn = this.container.querySelector('#ready-button');

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.stopMatchmaking();
        if (this.onMatchmakingCancelled) {
          this.onMatchmakingCancelled('user_cancelled');
        }
      });
    }

    if (readyBtn) {
      readyBtn.addEventListener('click', () => {
        if (this.markPlayerReady() && this.onPlayerReady) {
          this.onPlayerReady();
        }
      });
    }
  }

  updateReadyCheckDisplay() {
    const timerText = this.container.querySelector('.timer-text');
    const timerFill = this.container.querySelector('.timer-fill');
    
    if (timerText) {
      timerText.textContent = this.readyCheckTimeLeft;
    }
    
    if (timerFill) {
      timerFill.style.width = `${(this.readyCheckTimeLeft / 10) * 100}%`;
    }
  }

  updateStatus(message) {
    const statusEl = this.container.querySelector('#matchmaking-status');
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  showMessage(message) {
    const statusEl = this.container.querySelector('#matchmaking-status');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = 'status-message highlight';
      
      setTimeout(() => {
        statusEl.className = 'status-message';
      }, 3000);
    }
  }

  showError(message) {
    const statusEl = this.container.querySelector('#matchmaking-status');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = 'status-message error';
    }
  }

  setOnMatchmakingComplete(callback) {
    this.onMatchmakingComplete = callback;
  }

  setOnMatchmakingCancelled(callback) {
    this.onMatchmakingCancelled = callback;
  }

  setOnPlayerReady(callback) {
    this.onPlayerReady = callback;
  }
}

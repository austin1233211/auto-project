/**
 * Client-side reconnection manager for multiplayer games
 * Handles automatic reconnection attempts when connection is lost
 */
export class ReconnectionManager {
  constructor(socket) {
    this.socket = socket;
    this.sessionToken = null;
    this.isReconnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
    this.onReconnectSuccess = null;
    this.onReconnectFailed = null;
    this.onDisconnected = null;
    
    this.setupListeners();
  }

  /**
   * Set up socket event listeners
   */
  setupListeners() {
    this.socket.on('sessionCreated', ({ sessionToken }) => {
      this.sessionToken = sessionToken;
      console.log('[Reconnection] Session token received');
      
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('multiplayerSessionToken', sessionToken);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Reconnection] Disconnected:', reason);
      
      if (this.onDisconnected) {
        this.onDisconnected(reason);
      }
      
      if (this.sessionToken && reason !== 'io client disconnect') {
        this.attemptReconnection();
      }
    });

    this.socket.on('reconnectSuccess', (data) => {
      console.log('[Reconnection] Reconnection successful!', data);
      this.isReconnecting = false;
      this.reconnectAttempts = 0;
      
      if (this.onReconnectSuccess) {
        this.onReconnectSuccess(data);
      }
    });

    this.socket.on('reconnectFailed', ({ reason }) => {
      console.warn('[Reconnection] Reconnection failed:', reason);
      this.isReconnecting = false;
      
      this.sessionToken = null;
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('multiplayerSessionToken');
      }
      
      if (this.onReconnectFailed) {
        this.onReconnectFailed(reason);
      }
    });

    this.socket.on('playerDisconnected', ({ playerName, canReconnect, reconnectWindow }) => {
      console.log(`[Reconnection] Player ${playerName} disconnected. Can reconnect: ${canReconnect} (${reconnectWindow}s window)`);
    });

    this.socket.on('playerReconnected', ({ playerName }) => {
      console.log(`[Reconnection] Player ${playerName} reconnected!`);
    });
  }

  /**
   * Attempt to reconnect using stored session token
   */
  attemptReconnection() {
    if (this.isReconnecting) {
      console.log('[Reconnection] Already attempting reconnection');
      return;
    }

    if (!this.sessionToken) {
      console.log('[Reconnection] No session token available');
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[Reconnection] Max reconnection attempts reached');
      this.sessionToken = null;
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('multiplayerSessionToken');
      }
      if (this.onReconnectFailed) {
        this.onReconnectFailed('Max attempts reached');
      }
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    console.log(`[Reconnection] Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectDelay}ms...`);

    setTimeout(() => {
      if (!this.socket.connected) {
        console.log('[Reconnection] Socket not connected, connecting first...');
        this.socket.connect();
        
        setTimeout(() => {
          if (this.socket.connected) {
            console.log('[Reconnection] Socket connected, sending reconnect request...');
            this.socket.emit('reconnect', { sessionToken: this.sessionToken });
          } else {
            console.log('[Reconnection] Failed to connect socket, will retry...');
            this.isReconnecting = false;
            this.attemptReconnection();
          }
        }, 1000);
      } else {
        console.log('[Reconnection] Socket already connected, sending reconnect request...');
        this.socket.emit('reconnect', { sessionToken: this.sessionToken });
      }
    }, this.reconnectDelay);
  }

  /**
   * Try to restore session from localStorage on page load
   * @returns {boolean} True if restoration was attempted
   */
  tryRestoreSession() {
    if (typeof localStorage === 'undefined') {
      return false;
    }

    const storedToken = localStorage.getItem('multiplayerSessionToken');
    if (!storedToken) {
      return false;
    }

    console.log('[Reconnection] Found stored session token, attempting to restore...');
    this.sessionToken = storedToken;
    
    if (this.socket.connected) {
      this.socket.emit('reconnect', { sessionToken: storedToken });
      return true;
    } else {
      this.socket.connect();
      setTimeout(() => {
        if (this.socket.connected) {
          this.socket.emit('reconnect', { sessionToken: storedToken });
        }
      }, 1000);
      return true;
    }
  }

  /**
   * Clear session token (when leaving room intentionally)
   */
  clearSession() {
    this.sessionToken = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('multiplayerSessionToken');
    }
    console.log('[Reconnection] Session cleared');
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    this.socket.off('sessionCreated');
    this.socket.off('disconnect');
    this.socket.off('reconnectSuccess');
    this.socket.off('reconnectFailed');
    this.socket.off('playerDisconnected');
    this.socket.off('playerReconnected');
    this.clearSession();
  }
}

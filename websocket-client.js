export class WebSocketClient {
  constructor() {
    this.ws = null;
    this.tournamentId = null;
    this.playerId = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.pingInterval = null;
    
    this.onTournamentUpdate = null;
    this.onMatchUpdate = null;
    this.onPlayerReady = null;
    this.onReadyCheck = null;
    this.onReadyCheckComplete = null;
    this.onError = null;
    this.onConnect = null;
    this.onDisconnect = null;
  }

  async connect(tournamentId, playerId) {
    this.tournamentId = tournamentId;
    this.playerId = playerId;
    const wsUrl = `ws://localhost:8000/ws/tournament/${tournamentId}?player_id=${playerId}`;

    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('✅ WebSocket connected to tournament:', tournamentId);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startPingInterval();
        if (this.onConnect) this.onConnect();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('❌ WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.stopPingInterval();
        if (this.onDisconnect) this.onDisconnect(event);
        
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (this.onError) this.onError(error);
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      throw error;
    }
  }

  handleMessage(message) {
    console.log('📨 WebSocket message:', message);

    switch (message.type) {
      case 'tournament_state':
        if (this.onTournamentUpdate) {
          this.onTournamentUpdate(message.data);
        }
        break;

      case 'match_update':
        if (this.onMatchUpdate) {
          this.onMatchUpdate(message.data);
        }
        break;

      case 'player_ready':
        if (this.onPlayerReady) {
          this.onPlayerReady(message.player_id);
        }
        break;

      case 'ready_check_start':
        if (this.onReadyCheck) {
          this.onReadyCheck(message.data);
        }
        break;

      case 'ready_check_complete':
        if (this.onReadyCheckComplete) {
          this.onReadyCheckComplete(message.data);
        }
        break;

      case 'tournament_bracket':
        if (this.onTournamentUpdate) {
          this.onTournamentUpdate(message.data);
        }
        break;

      case 'pong':
        break;

      case 'error':
        console.error('WebSocket server error:', message.message);
        if (this.onError) this.onError(new Error(message.message));
        break;

      default:
        console.warn('Unknown WebSocket message type:', message.type);
    }
  }

  send(message) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message:', message);
    }
  }

  requestBracket() {
    this.send({ type: 'request_bracket' });
  }

  sendPlayerReady() {
    this.send({ type: 'ready_for_match' });
  }

  ping() {
    this.send({ type: 'ping' });
  }

  startPingInterval() {
    this.pingInterval = setInterval(() => {
      if (this.isConnected) {
        this.ping();
      }
    }, 30000);
  }

  stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  attemptReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Attempting WebSocket reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.tournamentId && this.playerId) {
        this.connect(this.tournamentId, this.playerId);
      }
    }, delay);
  }

  disconnect() {
    this.stopPingInterval();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.isConnected = false;
    this.tournamentId = null;
  }

  setOnTournamentUpdate(callback) { this.onTournamentUpdate = callback; }
  setOnMatchUpdate(callback) { this.onMatchUpdate = callback; }
  setOnPlayerReady(callback) { this.onPlayerReady = callback; }
  setOnReadyCheck(callback) { this.onReadyCheck = callback; }
  setOnReadyCheckComplete(callback) { this.onReadyCheckComplete = callback; }
  setOnError(callback) { this.onError = callback; }
  setOnConnect(callback) { this.onConnect = callback; }
  setOnDisconnect(callback) { this.onDisconnect = callback; }
}

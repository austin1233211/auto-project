export class MultiplayerClient {
  constructor(url = (typeof window !== 'undefined' ? (window.GAME_SERVER_URL || 'http://localhost:3001') : undefined)) {
    this.url = url;
    this.socket = null;
    this.handlers = {};
  }

  connect() {
    if (this.socket) return;
    this.url = this.url || (typeof window !== 'undefined' ? (window.GAME_SERVER_URL || 'http://localhost:3001') : undefined);
    
    const socketOptions = { 
      transports: ['polling'],
      upgrade: false,
      rememberUpgrade: false
    };
    
    this.socket = window.io(this.url, socketOptions);
    this.socket.on('connect', () => this._emit('connected'));
    this.socket.on('roomStatusUpdate', (status) => this._emit('roomStatusUpdate', status));
    this.socket.on('proceedToRules', (data) => this._emit('proceedToRules', data));
    this.socket.on('gameStarting', (data) => this._emit('gameStarting', data));
    this.socket.on('gameStart', (data) => this._emit('gameStart', data));
    this.socket.on('lobbyUpdate', (data) => this._emit('lobbyUpdate', data));
    this.socket.on('waitingRoomUpdate', (data) => this._emit('waitingRoomUpdate', data));
    this.socket.on('startHeroSelection', (data) => this._emit('startHeroSelection', data));
    this.socket.on('tournamentStart', (data) => this._emit('tournamentStart', data));
    this.socket.on('roundState', (data) => this._emit('roundState', data));
    this.socket.on('matchAssign', (data) => this._emit('matchAssign', data));
    this.socket.on('roundComplete', (data) => this._emit('roundComplete', data));
    this.socket.on('tournamentEnd', (data) => this._emit('tournamentEnd', data));
    this.socket.on('queueStatus', (data) => this._emit('queueStatus', data));
    this.socket.on('errorMessage', (msg) => this._emit('error', msg));
    this.socket.on('disconnect', () => this._emit('disconnected'));
  }

  on(event, cb) { this.handlers[event] = cb; }
  _emit(event, ...args) { if (this.handlers[event]) this.handlers[event](...args); }

  requestMatch(playerData) { this.socket.emit('requestMatch', playerData); }
  requestTournament(playerData) { this.socket.emit('requestTournament', playerData); }
  setReady() { this.socket.emit('playerReady'); }
  confirmRules() { this.socket.emit('confirmRules'); }
  selectHero(hero) { this.socket.emit('selectHero', { heroId: hero.id }); }
  updateName(data) { this.socket.emit('updateName', data); }
  sendBattleResult(data) { this.socket.emit('clientBattleResult', data); }
  leaveRoom() { this.socket.emit('leaveRoom'); }
}

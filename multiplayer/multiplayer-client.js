export class MultiplayerClient {
  constructor(url = (window.GAME_SERVER_URL || 'http://localhost:3001')) {
    this.url = url;
    this.socket = null;
    this.handlers = {};
  }

  connect() {
    if (this.socket) return;
    this.socket = window.io(this.url, { transports: ['websocket'] });
    this.socket.on('connect', () => this._emit('connected'));
    this.socket.on('roomStatusUpdate', (status) => this._emit('roomStatusUpdate', status));
    this.socket.on('proceedToRules', (data) => this._emit('proceedToRules', data));
    this.socket.on('gameStarting', (data) => this._emit('gameStarting', data));
    this.socket.on('gameStart', (data) => this._emit('gameStart', data));
    this.socket.on('errorMessage', (msg) => this._emit('error', msg));
    this.socket.on('disconnect', () => this._emit('disconnected'));
  }

  on(event, cb) { this.handlers[event] = cb; }
  _emit(event, ...args) { if (this.handlers[event]) this.handlers[event](...args); }

  requestMatch(playerData) { this.socket.emit('requestMatch', playerData); }
  setReady() { this.socket.emit('playerReady'); }
  confirmRules() { this.socket.emit('confirmRules'); }
  selectHero(hero) { this.socket.emit('selectHero', { heroId: hero.id }); }
  leaveRoom() { this.socket.emit('leaveRoom'); }
}

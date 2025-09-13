class ApiClient {
  constructor() {
    this.baseURL = 'http://localhost:3001/api';
    this.token = localStorage.getItem('auth_token');
    this.socket = null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  async put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  refreshToken() {
    this.token = localStorage.getItem('auth_token');
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  connectWebSocket() {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io('http://localhost:3001', {
      auth: {
        token: this.token
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    return this.socket;
  }

  disconnectWebSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  async login(email, password) {
    const response = await this.post('/auth/login', { email, password });
    this.setToken(response.token);
    return response;
  }

  async register(username, email, password) {
    const response = await this.post('/auth/register', { username, email, password });
    this.setToken(response.token);
    return response;
  }

  async getProfile() {
    return this.get('/auth/me');
  }

  async getTournaments() {
    return this.get('/tournaments');
  }

  async createTournament(name, maxPlayers = 8) {
    return this.post('/tournaments', { name, maxPlayers });
  }

  async getTournament(tournamentId) {
    return this.get(`/tournaments/${tournamentId}`);
  }

  async joinTournament(tournamentId, heroId) {
    return this.post(`/tournaments/${tournamentId}/join`, { heroId });
  }

  async leaveTournament(tournamentId) {
    return this.delete(`/tournaments/${tournamentId}/leave`);
  }

  async getHeroes() {
    return this.get('/game/heroes');
  }

  async getShop(tournamentId) {
    return this.get(`/game/tournaments/${tournamentId}/shop`);
  }

  async purchaseAbility(tournamentId, abilityId) {
    return this.post(`/game/tournaments/${tournamentId}/shop/purchase`, { abilityId });
  }

  async getMatches(tournamentId) {
    return this.get(`/game/tournaments/${tournamentId}/matches`);
  }

  async getMatch(matchId) {
    return this.get(`/game/matches/${matchId}`);
  }

  async simulateMatch(matchId) {
    return this.post(`/game/matches/${matchId}/simulate`);
  }

  joinTournamentRoom(tournamentId) {
    if (this.socket) {
      this.socket.emit('join_tournament', { tournamentId });
    }
  }

  leaveTournamentRoom(tournamentId) {
    if (this.socket) {
      this.socket.emit('leave_tournament', { tournamentId });
    }
  }

  startBattle(matchId) {
    if (this.socket) {
      this.socket.emit('start_battle', { matchId });
    }
  }

  broadcastPurchase(tournamentId, abilityId) {
    if (this.socket) {
      this.socket.emit('purchase_ability', { tournamentId, abilityId });
    }
  }
}

const apiClient = new ApiClient();
window.apiClient = apiClient;

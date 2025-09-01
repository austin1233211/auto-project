export class TournamentClient {
  constructor() {
    this.baseUrl = 'http://localhost:8000/api';
  }

  async createTournament(tournamentData) {
    const headers = {
      'Content-Type': 'application/json'
    };

    const response = await fetch(`${this.baseUrl}/tournaments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(tournamentData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to create tournament: ${response.statusText}`);
    }

    return await response.json();
  }

  async listTournaments(statusFilter = null) {
    const headers = { 'Content-Type': 'application/json' };
    const url = statusFilter 
      ? `${this.baseUrl}/tournaments?status_filter=${statusFilter}`
      : `${this.baseUrl}/tournaments`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to list tournaments: ${response.statusText}`);
    }

    return await response.json();
  }

  async getTournament(tournamentId) {
    const headers = { 'Content-Type': 'application/json' };
    const response = await fetch(`${this.baseUrl}/tournaments/${tournamentId}`, { headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to get tournament: ${response.statusText}`);
    }

    return await response.json();
  }

  async joinTournament(tournamentId, heroId, playerId) {
    const headers = {
      'Content-Type': 'application/json'
    };

    const response = await fetch(`${this.baseUrl}/tournaments/${tournamentId}/join`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        hero_id: heroId,
        player_id: playerId 
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to join tournament: ${response.statusText}`);
    }

    return await response.json();
  }

  async getTournamentParticipants(tournamentId) {
    const headers = { 'Content-Type': 'application/json' };
    const response = await fetch(`${this.baseUrl}/tournaments/${tournamentId}/participants`, { headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to get participants: ${response.statusText}`);
    }

    return await response.json();
  }

  async leaveTournament(tournamentId) {
    const headers = { 'Content-Type': 'application/json' };
    const response = await fetch(`${this.baseUrl}/tournaments/${tournamentId}/leave`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to leave tournament: ${response.statusText}`);
    }

    return await response.json();
  }
}

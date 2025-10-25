import crypto from 'crypto';
import { logger } from './logger.js';

/**
 * Session Manager for handling player reconnections
 * Maintains temporary session state for disconnected players
 */
class SessionManager {
  constructor() {
    this.sessions = new Map();
    
    this.socketToSession = new Map();
    
    this.reconnectionWindow = 60000;
    
    this.cleanupInterval = setInterval(() => this.cleanupExpiredSessions(), 10000);
  }

  /**
   * Generate a unique session token
   * @returns {string} Session token
   */
  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create a new session for a connected player
   * @param {string} socketId - Socket ID
   * @param {string} roomId - Room ID
   * @param {Object} playerData - Player data from room
   * @returns {string} Session token
   */
  createSession(socketId, roomId, playerData) {
    const token = this.generateToken();
    const session = {
      token,
      socketId,
      roomId,
      playerData: { ...playerData },
      createdAt: Date.now(),
      expiresAt: null, // Set when player disconnects
      isActive: true
    };
    
    this.sessions.set(token, session);
    this.socketToSession.set(socketId, token);
    
    logger.debug('[SessionManager] Created session', token, 'for socket', socketId, 'in room', roomId);
    return token;
  }

  /**
   * Mark a session as disconnected (start reconnection window)
   * @param {string} socketId - Socket ID
   * @returns {Object|null} Session data if found
   */
  markDisconnected(socketId) {
    const token = this.socketToSession.get(socketId);
    if (!token) {
      logger.debug('[SessionManager] No session found for disconnected socket', socketId);
      return null;
    }

    const session = this.sessions.get(token);
    if (!session) {
      logger.warn('[SessionManager] Session token found but session data missing', token);
      this.socketToSession.delete(socketId);
      return null;
    }

    session.isActive = false;
    session.expiresAt = Date.now() + this.reconnectionWindow;
    
    logger.info('[SessionManager] Marked session', token, 'as disconnected. Expires in', this.reconnectionWindow / 1000, 'seconds');
    return session;
  }

  /**
   * Attempt to reconnect a player using their session token
   * @param {string} token - Session token
   * @param {string} newSocketId - New socket ID
   * @returns {Object|null} Session data if reconnection successful
   */
  reconnect(token, newSocketId) {
    const session = this.sessions.get(token);
    
    if (!session) {
      logger.warn('[SessionManager] Reconnection failed: session not found', token);
      return null;
    }

    if (session.isActive) {
      logger.warn('[SessionManager] Reconnection failed: session already active', token);
      return null;
    }

    if (Date.now() > session.expiresAt) {
      logger.warn('[SessionManager] Reconnection failed: session expired', token);
      this.sessions.delete(token);
      this.socketToSession.delete(session.socketId);
      return null;
    }

    const oldSocketId = session.socketId;
    this.socketToSession.delete(oldSocketId);
    
    session.socketId = newSocketId;
    session.isActive = true;
    session.expiresAt = null;
    
    this.socketToSession.set(newSocketId, token);
    
    logger.info('[SessionManager] Reconnection successful', token, 'old socket:', oldSocketId, 'new socket:', newSocketId);
    return session;
  }

  /**
   * Get session data by socket ID
   * @param {string} socketId - Socket ID
   * @returns {Object|null} Session data
   */
  getSessionBySocketId(socketId) {
    const token = this.socketToSession.get(socketId);
    if (!token) return null;
    return this.sessions.get(token);
  }

  /**
   * Get session data by token
   * @param {string} token - Session token
   * @returns {Object|null} Session data
   */
  getSessionByToken(token) {
    return this.sessions.get(token);
  }

  /**
   * Destroy a session (player left permanently)
   * @param {string} socketId - Socket ID
   */
  destroySession(socketId) {
    const token = this.socketToSession.get(socketId);
    if (!token) return;

    this.sessions.delete(token);
    this.socketToSession.delete(socketId);
    
    logger.debug('[SessionManager] Destroyed session', token, 'for socket', socketId);
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [token, session] of this.sessions.entries()) {
      if (!session.isActive && session.expiresAt && now > session.expiresAt) {
        this.sessions.delete(token);
        this.socketToSession.delete(session.socketId);
        cleanedCount++;
        logger.debug('[SessionManager] Cleaned up expired session', token);
      }
    }

    if (cleanedCount > 0) {
      logger.info('[SessionManager] Cleaned up', cleanedCount, 'expired sessions');
    }
  }

  /**
   * Get all active sessions for a room
   * @param {string} roomId - Room ID
   * @returns {Array} Array of session data
   */
  getSessionsForRoom(roomId) {
    const sessions = [];
    for (const session of this.sessions.values()) {
      if (session.roomId === roomId) {
        sessions.push(session);
      }
    }
    return sessions;
  }

  /**
   * Shutdown the session manager
   */
  shutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.sessions.clear();
    this.socketToSession.clear();
    logger.info('[SessionManager] Shutdown complete');
  }
}

export const sessionManager = new SessionManager();

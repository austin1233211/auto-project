import { logger } from '../utils/logger.js';

/**
 * Unified game loop for combat system.
 * Consolidates multiple timers into a single setInterval for better performance and cleanup.
 */
export class GameLoop {
  constructor() {
    this.interval = null;
    this.tickRate = 50; // 50ms = 20 ticks per second
    this.tickCount = 0;
    this.isRunning = false;
    this.callbacks = new Map();
  }

  /**
   * Registers a callback to be called at a specific frequency.
   * @param {string} id - Unique identifier for this callback
   * @param {Function} callback - Function to call
   * @param {number} intervalMs - How often to call (in milliseconds)
   */
  register(id, callback, intervalMs) {
    const tickInterval = Math.max(1, Math.round(intervalMs / this.tickRate));
    this.callbacks.set(id, {
      callback,
      tickInterval,
      lastTick: 0
    });
  }

  /**
   * Unregisters a callback.
   * @param {string} id - Identifier of callback to remove
   */
  unregister(id) {
    this.callbacks.delete(id);
  }

  /**
   * Starts the game loop.
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.tickCount = 0;
    
    this.interval = setInterval(() => {
      this.tick();
    }, this.tickRate);
  }

  /**
   * Stops the game loop and clears all callbacks.
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    this.tickCount = 0;
    this.callbacks.clear();
  }

  /**
   * Executes one tick of the game loop.
   */
  tick() {
    this.tickCount++;
    
    for (const [id, data] of this.callbacks.entries()) {
      const ticksSinceLastCall = this.tickCount - data.lastTick;
      
      if (ticksSinceLastCall >= data.tickInterval) {
        try {
          data.callback();
          data.lastTick = this.tickCount;
        } catch (error) {
          logger.error(`GameLoop: Error in callback ${id}:`, error);
        }
      }
    }
  }

  /**
   * Checks if the game loop is currently running.
   */
  get running() {
    return this.isRunning;
  }
}

/**
 * Client-side Logger Utility
 * Provides centralized logging with environment-based control
 */

class Logger {
  constructor() {
    this.debugEnabled = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       localStorage.getItem('debugMode') === 'true';
  }

  /**
   * Enable or disable debug logging
   * @param {boolean} enabled 
   */
  setDebugEnabled(enabled) {
    this.debugEnabled = enabled;
    if (enabled) {
      localStorage.setItem('debugMode', 'true');
    } else {
      localStorage.removeItem('debugMode');
    }
  }

  /**
   * Debug level logging (only in development)
   * @param {...any} args 
   */
  debug(...args) {
    if (this.debugEnabled) {
      console.log('[DEBUG]', ...args);
    }
  }

  /**
   * Info level logging
   * @param {...any} args 
   */
  info(...args) {
    console.info('[INFO]', ...args);
  }

  /**
   * Warning level logging
   * @param {...any} args 
   */
  warn(...args) {
    console.warn('[WARN]', ...args);
  }

  /**
   * Error level logging
   * @param {...any} args 
   */
  error(...args) {
    console.error('[ERROR]', ...args);
  }

  /**
   * Log with custom prefix
   * @param {string} prefix 
   * @param {...any} args 
   */
  log(prefix, ...args) {
    if (this.debugEnabled) {
      console.log(`[${prefix}]`, ...args);
    }
  }
}

export const logger = new Logger();

if (typeof window !== 'undefined') {
  window.logger = logger;
}

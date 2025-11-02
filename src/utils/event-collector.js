/**
 * EventCollector - Utility for tracking and cleaning up event listeners
 * 
 * Usage:
 *   this.events = new EventCollector();
 *   this.events.add(element, 'click', handler);
 *   this.events.cleanup(); // Remove all tracked listeners
 */
export class EventCollector {
  constructor() {
    this.listeners = [];
  }

  /**
   * Add an event listener and track it for cleanup
   * @param {Element} element - DOM element to attach listener to
   * @param {string} event - Event name (e.g., 'click', 'change')
   * @param {Function} handler - Event handler function
   * @param {Object} options - Optional addEventListener options
   */
  add(element, event, handler, options = {}) {
    if (!element) {
      console.warn('[EventCollector] Attempted to add listener to null element');
      return;
    }

    element.addEventListener(event, handler, options);
    this.listeners.push({ element, event, handler, options });
  }

  /**
   * Remove all tracked event listeners
   */
  cleanup() {
    this.listeners.forEach(({ element, event, handler, options }) => {
      if (element) {
        element.removeEventListener(event, handler, options);
      }
    });
    this.listeners = [];
  }

  /**
   * Get count of tracked listeners (useful for debugging)
   */
  count() {
    return this.listeners.length;
  }
}

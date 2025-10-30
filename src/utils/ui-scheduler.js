export class UIScheduler {
  constructor() {
    this.pendingUpdates = new Map();
    this.isScheduled = false;
  }

  scheduleUpdate(key, updateFn) {
    this.pendingUpdates.set(key, updateFn);
    
    if (!this.isScheduled) {
      this.isScheduled = true;
      requestAnimationFrame(() => this.flush());
    }
  }

  flush() {
    const updates = Array.from(this.pendingUpdates.values());
    this.pendingUpdates.clear();
    this.isScheduled = false;
    
    updates.forEach(updateFn => {
      try {
        updateFn();
      } catch (error) {
        console.error('UI update error:', error);
      }
    });
  }

  clear() {
    this.pendingUpdates.clear();
    this.isScheduled = false;
  }
}

export const globalUIScheduler = new UIScheduler();

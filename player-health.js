export class PlayerHealth {
  constructor(heroHealth = 50) {
    this.maxHealth = heroHealth;
    this.currentHealth = heroHealth;
    this.consecutiveLosses = 0;
    this.onHealthChanged = null;
    this.onGameOver = null;
  }

  init() {
    this.currentHealth = this.maxHealth;
    this.consecutiveLosses = 0;
    this.notifyHealthChanged();
  }

  processRoundResult(result) {
    if (result === 'defeat') {
      this.consecutiveLosses++;
      const healthLoss = this.calculateHealthLoss();
      this.currentHealth = Math.max(0, this.currentHealth - healthLoss);
      
      this.notifyHealthChanged();
      
      if (this.currentHealth <= 0) {
        this.notifyGameOver();
      }
    } else if (result === 'victory') {
      this.consecutiveLosses = 0;
      this.notifyHealthChanged();
    }
  }

  calculateHealthLoss() {
    const baseLoss = 2;
    const additionalLoss = Math.min(this.consecutiveLosses - 1, 3);
    return baseLoss + additionalLoss;
  }

  getHealthPercentage() {
    return (this.currentHealth / this.maxHealth) * 100;
  }

  getHealthStatus() {
    return {
      current: this.currentHealth,
      max: this.maxHealth,
      percentage: this.getHealthPercentage(),
      consecutiveLosses: this.consecutiveLosses,
      nextLossAmount: this.calculateHealthLoss()
    };
  }

  setOnHealthChanged(callback) {
    this.onHealthChanged = callback;
  }

  setOnGameOver(callback) {
    this.onGameOver = callback;
  }

  notifyHealthChanged() {
    if (this.onHealthChanged) {
      this.onHealthChanged(this.getHealthStatus());
    }
  }

  notifyGameOver() {
    if (this.onGameOver) {
      this.onGameOver();
    }
  }

  reset() {
    this.init();
  }
}

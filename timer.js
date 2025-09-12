export class Timer {
  constructor() {
    this.roundDuration = 50;
    this.bufferDuration = 30;
    this.currentTime = 0;
    this.isRunning = false;
    this.isBufferPhase = false;
    this.timerInterval = null;
    this.onTimerUpdate = null;
    this.onRoundEnd = null;
    this.onDamageEscalation = null;
    this.damageEscalationActive = false;
  }

  startBuffer(onBufferEnd) {
    this.stopTimer();
    this.isBufferPhase = true;
    this.currentTime = this.bufferDuration;
    this.isRunning = true;
    
    this.timerInterval = setInterval(() => {
      this.currentTime--;
      
      if (this.onTimerUpdate) {
        this.onTimerUpdate({
          time: this.currentTime,
          isBuffer: true,
          phase: 'buffer'
        });
      }
      
      if (this.currentTime <= 0) {
        this.stopTimer();
        this.isBufferPhase = false;
        if (onBufferEnd) onBufferEnd();
        this.startRound();
      }
    }, 1000);
  }

  startRound() {
    this.stopTimer();
    this.isBufferPhase = false;
    this.currentTime = this.roundDuration;
    this.isRunning = true;
    this.damageEscalationActive = false;
    
    this.timerInterval = setInterval(() => {
      this.currentTime--;
      
      if (this.currentTime === 30 && !this.damageEscalationActive) {
        this.damageEscalationActive = true;
        if (this.onDamageEscalation) {
          this.onDamageEscalation(true);
        }
      }
      
      const secondsElapsed = this.roundDuration - this.currentTime;
      const damageMultiplier = secondsElapsed >= 20 ? 1 + (0.06 * (secondsElapsed - 20)) : 1;
      
      if (this.onTimerUpdate) {
        this.onTimerUpdate({
          time: this.currentTime,
          isBuffer: false,
          phase: 'round',
          damageEscalation: this.damageEscalationActive,
          damageMultiplier: damageMultiplier
        });
      }
      
      if (this.currentTime <= 0) {
        this.endRound();
      }
    }, 1000);
  }

  endRound() {
    this.stopTimer();
    if (this.onDamageEscalation) {
      this.onDamageEscalation(false);
    }
    if (this.onRoundEnd) {
      this.onRoundEnd();
    }
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isRunning = false;
  }

  setOnTimerUpdate(callback) {
    this.onTimerUpdate = callback;
  }

  setOnRoundEnd(callback) {
    this.onRoundEnd = callback;
  }

  setOnDamageEscalation(callback) {
    this.onDamageEscalation = callback;
  }
}

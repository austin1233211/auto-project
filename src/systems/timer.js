import { debugTools } from '../components/debug-tools.js';
import { TIMER_CONSTANTS } from '../core/constants.js';

export class Timer {
  constructor() {
    this.roundDuration = TIMER_CONSTANTS.ROUND_DURATION;
    this.bufferDuration = TIMER_CONSTANTS.BUFFER_DURATION;
    this.currentTime = 0;
    this.isRunning = false;
    this.isBufferPhase = false;
    this.currentPhase = null;
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
    
    debugTools.logDebug(`⏱️ Timer: Starting buffer phase (${this.bufferDuration}s)`);
    
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
        debugTools.logDebug('⏱️ Timer: Buffer phase completed');
        if (onBufferEnd) onBufferEnd();
      }
    }, 1000);
    
    debugTools.registerTimer('rounds_buffer', 'rounds', 1000, `Buffer phase timer (${this.bufferDuration}s)`);
  }

  startRound() {
    this.stopTimer();
    this.isBufferPhase = false;
    this.currentTime = this.roundDuration;
    this.isRunning = true;
    this.damageEscalationActive = false;
    
    debugTools.logDebug(`⏱️ Timer: Starting round phase (${this.roundDuration}s)`);
    
    this.timerInterval = setInterval(() => {
      this.currentTime--;
      
      if (this.currentTime === TIMER_CONSTANTS.DAMAGE_ESCALATION_FLAG_AT_REMAINING && !this.damageEscalationActive) {
        this.damageEscalationActive = true;
        debugTools.logDebug('⏱️ Timer: Damage escalation activated');
        if (this.onDamageEscalation) {
          this.onDamageEscalation(true);
        }
      }
      
      const secondsElapsed = this.roundDuration - this.currentTime;
      const damageMultiplier = secondsElapsed >= TIMER_CONSTANTS.DAMAGE_ESCALATION_THRESHOLD_ELAPSED 
        ? 1 + (TIMER_CONSTANTS.DAMAGE_ESCALATION_RATE * (secondsElapsed - TIMER_CONSTANTS.DAMAGE_ESCALATION_THRESHOLD_ELAPSED)) 
        : 1;
      
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
    
    debugTools.registerTimer('rounds_main', 'rounds', 1000, `Round phase timer (${this.roundDuration}s)`);
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
      const phase = this.isBufferPhase ? 'buffer' : (this.currentPhase === 'selection' ? 'selection' : 'round');
      debugTools.logDebug(`⏱️ Timer: Stopping timer (was in ${phase} phase)`);
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      
      if (this.isBufferPhase) {
        debugTools.unregisterTimer('rounds_buffer');
      } else if (this.currentPhase === 'selection') {
        debugTools.unregisterTimer('hero_selection');
      } else {
        debugTools.unregisterTimer('rounds_main');
      }
    }
    this.isRunning = false;
    this.currentPhase = null;
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

  startSelection(duration = TIMER_CONSTANTS.SELECTION_DURATION) {
    this.stopTimer();
    this.isBufferPhase = false;
    this.currentPhase = 'selection';
    this.currentTime = duration;
    this.isRunning = true;
    
    debugTools.logDebug(`⏱️ Timer: Starting selection phase (${duration}s)`);
    
    this.timerInterval = setInterval(() => {
      this.currentTime--;
      
      if (this.onTimerUpdate) {
        this.onTimerUpdate({
          time: this.currentTime,
          isBuffer: false,
          phase: 'selection',
          damageEscalation: false,
          damageMultiplier: 1
        });
      }
      
      if (this.currentTime <= 0) {
        this.stopTimer();
        if (this.onRoundEnd) {
          this.onRoundEnd();
        }
      }
    }, 1000);
    
    debugTools.registerTimer('hero_selection', 'selection', 1000, `Selection phase timer (${duration}s)`);
  }
}

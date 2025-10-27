export class DebugTools {
  constructor() {
    this.activeTimers = new Map();
    this.processStartTimes = new Map();
    this.timerOverlapWarnings = [];
    this.processLogs = [];
    this.maxProcessDuration = 30000; // 30 seconds max for any process
    this.isDebugMode = true;
  }

  registerTimer(timerId, type, interval, description) {
    if (!this.isDebugMode) return;
    
    const timerInfo = {
      id: timerId,
      type: type, // 'combat', 'rounds', 'mana', 'ui', etc.
      interval: interval,
      description: description,
      startTime: Date.now(),
      isActive: true
    };
    
    this.activeTimers.set(timerId, timerInfo);
    this.logDebug(`🟢 Timer registered: ${type} - ${description} (${interval}ms interval)`);
    
    this.checkTimerOverlaps(timerInfo);
  }

  unregisterTimer(timerId) {
    if (!this.isDebugMode) return;
    
    const timerInfo = this.activeTimers.get(timerId);
    if (timerInfo) {
      timerInfo.isActive = false;
      timerInfo.endTime = Date.now();
      timerInfo.duration = timerInfo.endTime - timerInfo.startTime;
      
      this.logDebug(`🔴 Timer unregistered: ${timerInfo.type} - ${timerInfo.description} (ran for ${timerInfo.duration}ms)`);
      this.activeTimers.delete(timerId);
    }
  }

  checkTimerOverlaps(newTimer) {
    const similarTimers = Array.from(this.activeTimers.values()).filter(timer => 
      timer.type === newTimer.type && timer.id !== newTimer.id && timer.isActive
    );
    
    if (similarTimers.length > 0) {
      const warning = `⚠️ TIMER OVERLAP DETECTED: Multiple ${newTimer.type} timers running simultaneously`;
      this.timerOverlapWarnings.push({
        timestamp: Date.now(),
        type: newTimer.type,
        conflictingTimers: [newTimer, ...similarTimers],
        warning: warning
      });
      
      console.warn(warning);
      console.warn('Conflicting timers:', [newTimer, ...similarTimers]);
    }
  }

  startProcess(processId, description, expectedDuration = 10000) {
    if (!this.isDebugMode) return;
    
    const processInfo = {
      id: processId,
      description: description,
      startTime: Date.now(),
      expectedDuration: expectedDuration,
      isActive: true
    };
    
    this.processStartTimes.set(processId, processInfo);
    this.logDebug(`🚀 Process started: ${description} (expected: ${expectedDuration}ms)`);
    
    setTimeout(() => {
      if (this.processStartTimes.has(processId)) {
        const process = this.processStartTimes.get(processId);
        if (process.isActive) {
          const runningTime = Date.now() - process.startTime;
          console.warn(`⏰ LONG RUNNING PROCESS: ${description} has been running for ${runningTime}ms`);
          
          if (runningTime > this.maxProcessDuration) {
            console.error(`🚨 INFINITE LOOP DETECTED: ${description} exceeded maximum duration (${this.maxProcessDuration}ms)`);
          }
        }
      }
    }, expectedDuration * 2);
  }

  endProcess(processId) {
    if (!this.isDebugMode) return;
    
    const processInfo = this.processStartTimes.get(processId);
    if (processInfo) {
      processInfo.isActive = false;
      processInfo.endTime = Date.now();
      processInfo.actualDuration = processInfo.endTime - processInfo.startTime;
      
      const status = processInfo.actualDuration > processInfo.expectedDuration * 1.5 ? '🐌 SLOW' : '✅ OK';
      this.logDebug(`${status} Process completed: ${processInfo.description} (${processInfo.actualDuration}ms)`);
      
      this.processLogs.push(processInfo);
      this.processStartTimes.delete(processId);
    }
  }

  validateBattleState(roundNumber, userBattleCompleted, backgroundMatches, activePlayers) {
    if (!this.isDebugMode) return;
    
    const stateInfo = {
      timestamp: Date.now(),
      round: roundNumber,
      userBattleCompleted: userBattleCompleted,
      backgroundMatchesCount: backgroundMatches ? backgroundMatches.length : 0,
      activePlayersCount: activePlayers ? activePlayers.length : 0,
      activeTimersCount: this.activeTimers.size
    };
    
    this.logDebug(`🎯 Battle State Validation - Round ${roundNumber}:`);
    this.logDebug(`   User battle completed: ${userBattleCompleted}`);
    this.logDebug(`   Background matches: ${stateInfo.backgroundMatchesCount}`);
    this.logDebug(`   Active players: ${stateInfo.activePlayersCount}`);
    this.logDebug(`   Active timers: ${stateInfo.activeTimersCount}`);
    
    if (userBattleCompleted && this.activeTimers.size > 2) {
      console.warn(`⚠️ User battle completed but ${this.activeTimers.size} timers still active`);
    }
    
    return stateInfo;
  }

  getTimerHealthReport() {
    const activeTimersList = Array.from(this.activeTimers.values());
    const report = {
      timestamp: Date.now(),
      activeTimersCount: activeTimersList.length,
      activeTimers: activeTimersList,
      timerOverlaps: this.timerOverlapWarnings,
      longRunningProcesses: Array.from(this.processStartTimes.values()).filter(p => 
        p.isActive && (Date.now() - p.startTime) > p.expectedDuration * 2
      ),
      completedProcesses: this.processLogs.slice(-10) // Last 10 completed processes
    };
    
    return report;
  }

  logRoundTransition(fromRound, toRound, reason, playerCount) {
    if (!this.isDebugMode) return;
    
    this.logDebug(`🔄 ROUND TRANSITION: ${fromRound} → ${toRound}`);
    this.logDebug(`   Reason: ${reason}`);
    this.logDebug(`   Players remaining: ${playerCount}`);
    this.logDebug(`   Active timers before transition: ${this.activeTimers.size}`);
    
    this.activeTimers.forEach((timer) => {
      const runningTime = Date.now() - timer.startTime;
      this.logDebug(`   Active timer: ${timer.type} - ${timer.description} (${runningTime}ms)`);
    });
  }

  monitorBackgroundMatch(matchIndex, player1Name, player2Name, delay) {
    if (!this.isDebugMode) return;
    
    const matchId = `bg_match_${matchIndex}_${Date.now()}`;
    this.startProcess(matchId, `Background match: ${player1Name} vs ${player2Name}`, delay + 1000);
    
    return matchId;
  }

  logDebug(message) {
    if (this.isDebugMode) {
      const timestamp = new Date().toISOString().substr(11, 12);
      console.log(`[DEBUG ${timestamp}] ${message}`);
    }
  }

  generateTestReport(roundNumber) {
    const report = {
      timestamp: Date.now(),
      round: roundNumber,
      timerHealth: this.getTimerHealthReport(),
      summary: {
        totalTimerOverlaps: this.timerOverlapWarnings.length,
        activeTimers: this.activeTimers.size,
        longRunningProcesses: Array.from(this.processStartTimes.values()).filter(p => 
          p.isActive && (Date.now() - p.startTime) > p.expectedDuration * 2
        ).length,
        completedProcesses: this.processLogs.length
      }
    };
    
    console.log(`\n📊 ROUND ${roundNumber} DEBUG REPORT:`);
    console.log(`   Timer overlaps detected: ${report.summary.totalTimerOverlaps}`);
    console.log(`   Currently active timers: ${report.summary.activeTimers}`);
    console.log(`   Long-running processes: ${report.summary.longRunningProcesses}`);
    console.log(`   Total processes completed: ${report.summary.completedProcesses}`);
    
    if (report.summary.totalTimerOverlaps > 0) {
      console.warn('⚠️ TIMER OVERLAP WARNINGS:');
      this.timerOverlapWarnings.forEach((warning, index) => {
        console.warn(`   ${index + 1}. ${warning.warning}`);
      });
    }
    
    return report;
  }

  reset() {
    this.activeTimers.clear();
    this.processStartTimes.clear();
    this.timerOverlapWarnings = [];
    this.processLogs = [];
    this.logDebug('🔄 Debug tools reset for new test session');
  }

  setDebugMode(enabled) {
    this.isDebugMode = enabled;
    this.logDebug(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }
}

export const debugTools = new DebugTools();

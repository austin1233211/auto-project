import { ROUND_CONSTANTS } from '../core/constants.js';

export class DevTestPanel {
  constructor() {
    this.__modules = {};
    this.__combat = null;
    this.__hotkeysAttached = false;
  }

  attachModules(mods) {
    this.__modules = Object.assign(this.__modules || {}, mods);
  }

  attachCombat(combat) {
    this.__combat = combat;
  }

  renderPanel() {
    const existing = document.getElementById('dev-test-panel');
    if (existing) existing.remove();
    const panel = document.createElement('div');
    panel.id = 'dev-test-panel';
    panel.style.position = 'fixed';
    panel.style.right = '10px';
    panel.style.bottom = '10px';
    panel.style.width = '420px';
    panel.style.maxHeight = '70vh';
    panel.style.overflow = 'auto';
    panel.style.background = 'rgba(0,0,0,0.85)';
    panel.style.color = '#fff';
    panel.style.padding = '10px';
    panel.style.borderRadius = '8px';
    panel.style.zIndex = '9999';
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <div>🧪 Dev Test Panel</div>
        <button id="devtest-close" style="background:#444;color:#fff;border:none;border-radius:4px;padding:4px 8px;">×</button>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
        <button id="devtest-verify-tiers" class="btn">Verify Tiers 5/10/15/20</button>
        <button id="devtest-clear" class="btn">Clear</button>
      </div>
      <div style="margin-bottom:8px;">
        <div style="font-weight:bold;margin-bottom:4px;">Give Equipment</div>
        <input id="devtest-equip-type" placeholder="e.g. shivas_guard" style="width:68%;padding:4px;border-radius:4px;border:1px solid #666;background:#222;color:#fff;" />
        <button id="devtest-give-player" class="btn">To Player</button>
        <button id="devtest-give-enemy" class="btn">To Enemy</button>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
        <button id="devtest-player-50" class="btn">Player 50%</button>
        <button id="devtest-player-20" class="btn">Player 20%</button>
        <button id="devtest-enemy-50" class="btn">Enemy 50%</button>
        <button id="devtest-enemy-20" class="btn">Enemy 20%</button>
      </div>
      <div id="devtest-log" style="font-family:monospace;font-size:12px;display:flex;flex-direction:column-reverse;gap:2px;"></div>
      <style>
        #dev-test-panel .btn { background:#2b6; color:#fff; border:none; border-radius:4px; padding:4px 8px; cursor:pointer; }
        #dev-test-panel .btn:disabled { background:#555; cursor:not-allowed; }
      </style>
    `;
    document.body.appendChild(panel);
    panel.querySelector('#devtest-close').onclick = () => panel.remove();

    const log = (msg) => {
      const el = document.createElement('div');
      el.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
      const logEl = document.getElementById('devtest-log');
      if (logEl) logEl.appendChild(el);
    };

    const eqType = () => (document.getElementById('devtest-equip-type')?.value || '').trim();
    const give = (who) => {
      const type = eqType();
      if (!type) return;
      const c = this.__combat;
      if (!c) return log('No active combat');
      const hero = who === 'enemy' ? c.enemyHero : c.playerHero;
      if (!hero) return;
      hero.equipment = hero.equipment || [];
      hero.equipment.push({ type });
      hero.equipmentState = hero.equipmentState || {};
      log(`Gave ${type} to ${who}`);
      if (c.updateHealthBars) c.updateHealthBars();
      if (c.updateManaBars) c.updateManaBars();
      if (c.heroStatsCard && c.heroStatsCard.update && who !== 'enemy') c.heroStatsCard.update(c.playerHero);
    };

    const btnPlayer = panel.querySelector('#devtest-give-player');
    const btnEnemy = panel.querySelector('#devtest-give-enemy');
    if (btnPlayer) btnPlayer.onclick = () => give('player');
    if (btnEnemy) btnEnemy.onclick = () => give('enemy');

    const setHpPct = (who, pct) => {
      const c = this.__combat;
      if (!c) return;
      const hero = who === 'enemy' ? c.enemyHero : c.playerHero;
      if (!hero?.stats?.health) return;
      hero.currentHealth = Math.max(1, Math.floor(hero.stats.health * (pct / 100)));
      if (c.updateHealthBars) c.updateHealthBars();
      log(`Set ${who} HP to ${pct}%`);
    };
    panel.querySelector('#devtest-player-50')?.addEventListener('click', () => setHpPct('player', 50));
    panel.querySelector('#devtest-player-20')?.addEventListener('click', () => setHpPct('player', 20));
    panel.querySelector('#devtest-enemy-50')?.addEventListener('click', () => setHpPct('enemy', 50));
    panel.querySelector('#devtest-enemy-20')?.addEventListener('click', () => setHpPct('enemy', 20));

    panel.querySelector('#devtest-clear')?.addEventListener('click', () => {
      const logEl = document.getElementById('devtest-log');
      if (logEl) logEl.innerHTML = '';
    });

    panel.querySelector('#devtest-verify-tiers')?.addEventListener('click', () => {
      try {
        const ER = this.__modules?.EquipmentReward;
        if (!ER?.debugGenerateForRound) {
          log('EquipmentReward.debugGenerateForRound unavailable');
          return;
        }
        ROUND_CONSTANTS.MINION_ROUNDS.forEach(r => {
          const types = ER.debugGenerateForRound(r, true) || [];
          log(`Round ${r}: ${types.join(', ')}`);
        });
      } catch (e) {
        log(`Tier verify error: ${e?.message || e}`);
      }
    });
  }

  attachHotkeys() {
    if (this.__hotkeysAttached) return;
    this.__hotkeysAttached = true;
    window.addEventListener('keydown', (e) => {
      if (e.key === 'd' || e.key === 'D') this.renderPanel();
      if (e.key === '1') this.__quickGive('shivas_guard');
      if (e.key === '2') this.__quickGive('martyrs_plate');
      if (e.key === '3') this.__quickGive('magic_lamp');
      if (e.key === '4') this.__quickGive('heavens_blade');
      if (e.key === '5') this.__quickGive('monkey_king_bar');
      if (e.key === '6') this.__quickGive('radiance');
      if (e.key === '7') this.__quickGive('archanist_armor');
    });
  }

  __quickGive(type) {
    const c = this.__combat;
    if (!c) return;
    const hero = c.playerHero;
    if (!hero) return;
    hero.equipment = hero.equipment || [];
    hero.equipment.push({ type });
    hero.equipmentState = hero.equipmentState || {};
    if (c.updateHealthBars) c.updateHealthBars();
    if (c.updateManaBars) c.updateManaBars();
    if (c.heroStatsCard && c.heroStatsCard.update) c.heroStatsCard.update(c.playerHero);
  }
}

export const devTestPanel = new DevTestPanel();

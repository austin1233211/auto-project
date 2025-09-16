export class PlayerCounter {
  constructor(container) {
    this.container = container;
    this.current = 0;
    this.max = 0;
    this.textEl = null;
  }

  mount() {
    if (!this.container) return;
    this.container.innerHTML = `<span class="player-counter-text"></span>`;
    this.textEl = this.container.querySelector('.player-counter-text');
    this.render();
  }

  setCounts(current, max) {
    this.current = typeof current === 'number' ? current : 0;
    this.max = typeof max === 'number' ? max : 0;
    this.render();
  }

  render() {
    if (!this.textEl) return;
    if (this.max > 0) {
      this.textEl.textContent = `${this.current}/${this.max} players`;
    } else {
      this.textEl.textContent = `${this.current} players`;
    }
  }
}

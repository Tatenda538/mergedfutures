export const SyncStatus = {
  _queue: null,
  _interval: null,

  init(syncQueue) {
    this._queue = syncQueue;
    this._updateIndicator();
    this._interval = setInterval(() => this._updateIndicator(), 2000);
  },

  _updateIndicator() {
    const el = document.getElementById('sync-status');
    if (!el) return;
    const len = this._queue.length();
    el.className = 'sync-status';
    if (len === 0) {
      el.classList.add('sync-idle');
      el.textContent = '\u25cf';
    } else {
      el.classList.add('sync-pending');
      el.textContent = `\u25cf ${len}`;
    }
  },

  destroy() {
    if (this._interval) clearInterval(this._interval);
  },
};

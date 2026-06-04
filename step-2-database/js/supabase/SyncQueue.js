const STORAGE_KEY = 'asteroids_sync_queue';

export class SyncQueue {
  constructor(flushFn) {
    this.flushFn = flushFn;
    this.queue = this._load();
  }

  _load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  _save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
  }

  length() {
    return this.queue.length;
  }

  enqueue(item) {
    this.queue.push(item);
    this._save();
  }

  flush() {
    const items = [...this.queue];
    this.queue = [];
    this._save();
    return items;
  }

  async triggerFlush() {
    if (this.queue.length === 0) return;
    const items = this.flush();
    try {
      await this.flushFn(items);
    } catch {
      this.queue = [...items, ...this.queue];
      this._save();
    }
  }
}

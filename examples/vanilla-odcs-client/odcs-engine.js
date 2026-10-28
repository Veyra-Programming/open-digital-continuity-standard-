/**
 * ODCS Reference Engine — Pure ES6 Reference Implementation
 * Demonstrates the 4-Layer ODC Architecture:
 * - Layer 1: Local Durability (IndexedDB WAL Outbox + Entity Store)
 * - Layer 2: Transport & Sync Engine (Store-and-Forward Outbox Pipeline)
 * - Layer 3: Runtime & Environmental Adapter (Network State & Telemetry)
 * - Layer 4: Application & Continuity UX (Optimistic State & Status Affordances)
 */

export class OdcsEngine {
  constructor(options = {}) {
    this.dbName = options.dbName || 'odcs_demo_db';
    this.version = options.version || 1;
    this.nodeId = 'node-' + Math.random().toString(36).substring(2, 9);
    this.db = null;
    
    // Layer 3 State
    this.networkMode = 'OPTIMAL_ONLINE'; // 'OPTIMAL_ONLINE' | 'CONSTRAINED' | 'OFFLINE'
    this.listeners = {
      mode: new Set(),
      status: new Set(),
      entityChange: new Set()
    };
    
    // Simulated remote server state
    this.isSyncing = false;
  }

  // --- LAYER 1: LOCAL DURABILITY ---
  async initStorage() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, this.version);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('outbox_wal')) {
          const outbox = db.createObjectStore('outbox_wal', { keyPath: 'id' });
          outbox.createIndex('status', 'status', { unique: false });
        }
        if (!db.objectStoreNames.contains('entities')) {
          db.createObjectStore('entities', { keyPath: 'id' });
        }
      };
      req.onsuccess = () => {
        this.db = req.result;
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  }

  async recordMutation(entity, action, payload) {
    const mutation = {
      id: 'mut-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
      nodeId: this.nodeId,
      entity,
      action,
      payload,
      status: 'QUEUED_OUTBOX',
      retryCount: 0
    };

    await new Promise((resolve, reject) => {
      const tx = this.db.transaction(['outbox_wal', 'entities'], 'readwrite');
      tx.objectStore('outbox_wal').add(mutation);

      const entityStore = tx.objectStore('entities');
      if (action === 'DELETE') {
        entityStore.delete(payload.id);
      } else {
        entityStore.put({ id: payload.id, ...payload, _updatedAt: mutation.timestamp });
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    this._emitEntityChange();
    this._updateContinuityBadge();

    // Trigger Layer 2 sync attempt if Layer 3 permits
    if (this.canSynchronize()) {
      this.triggerSync();
    }

    return mutation;
  }

  async getAllEntities() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('entities', 'readonly');
      const req = tx.objectStore('entities').getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async getPendingOutbox() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('outbox_wal', 'readonly');
      const req = tx.objectStore('outbox_wal').getAll();
      req.onsuccess = () => {
        const pending = (req.result || []).filter(m => m.status === 'QUEUED_OUTBOX');
        resolve(pending);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async markMutationsSynced(ids) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('outbox_wal', 'readwrite');
      const store = tx.objectStore('outbox_wal');
      for (const id of ids) {
        store.delete(id);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- LAYER 3: RUNTIME & ENVIRONMENTAL ADAPTATION ---
  setNetworkMode(mode) {
    const oldMode = this.networkMode;
    this.networkMode = mode;
    for (const cb of this.listeners.mode) cb(mode, oldMode);
    this._updateContinuityBadge();

    if (this.canSynchronize()) {
      this.triggerSync();
    }
  }

  canSynchronize() {
    return this.networkMode !== 'OFFLINE' && !this.isSyncing;
  }

  // --- LAYER 2: TRANSPORT & SYNCHRONIZATION ---
  async triggerSync() {
    if (!this.canSynchronize()) return;

    const pending = await this.getPendingOutbox();
    if (pending.length === 0) {
      this._updateContinuityBadge();
      return;
    }

    this.isSyncing = true;
    this._updateContinuityBadge();

    // Simulate network latency based on Layer 3 mode
    const delay = this.networkMode === 'CONSTRAINED' ? 2200 : 700;

    setTimeout(async () => {
      if (this.networkMode === 'OFFLINE') {
        this.isSyncing = false;
        this._updateContinuityBadge();
        return;
      }

      // Mark local mutations as synced
      const syncedIds = pending.map(m => m.id);
      await this.markMutationsSynced(syncedIds);

      this.isSyncing = false;
      this._updateContinuityBadge();
      this._emitEntityChange();
    }, delay);
  }

  // --- LAYER 4: APPLICATION & CONTINUITY UX ---
  async _updateContinuityBadge() {
    const pending = await this.getPendingOutbox();
    let state = 'SYNCHRONIZED';
    let message = 'All Changes Synced';

    if (this.isSyncing) {
      state = 'SYNCING';
      message = `Syncing ${pending.length} change${pending.length === 1 ? '' : 's'}...`;
    } else if (pending.length > 0) {
      state = 'BUFFERED';
      message = `Saved Locally (${pending.length} queued)`;
    } else if (this.networkMode === 'OFFLINE') {
      state = 'BUFFERED';
      message = 'Offline (0 queued)';
    }

    const payload = {
      state,
      message,
      pendingCount: pending.length,
      networkMode: this.networkMode,
      nodeId: this.nodeId
    };

    for (const cb of this.listeners.status) cb(payload);
  }

  _emitEntityChange() {
    this.getAllEntities().then(entities => {
      for (const cb of this.listeners.entityChange) cb(entities);
    });
  }

  subscribeStatus(cb) {
    this.listeners.status.add(cb);
    this._updateContinuityBadge();
    return () => this.listeners.status.delete(cb);
  }

  subscribeEntities(cb) {
    this.listeners.entityChange.add(cb);
    this.getAllEntities().then(cb);
    return () => this.listeners.entityChange.delete(cb);
  }

  subscribeMode(cb) {
    this.listeners.mode.add(cb);
    return () => this.listeners.mode.delete(cb);
  }
}

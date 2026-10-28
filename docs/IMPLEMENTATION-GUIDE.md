# ODCS Implementation Guide: Building Resilient Applications
## Developer Handbook & Integration Recipes | Version 1.0.0-DRAFT

---

## 1. Introduction

This guide provides concrete, copy-pasteable patterns for implementing the four layers of the Open Digital Continuity Standard in modern web and distributed applications.

---

## 2. Layer 1 Implementation: Minimal Durable IndexedDB Engine

Here is a reference Layer 1 implementation in pure JavaScript (ES6+):

```javascript
// odcs-layer1-storage.js
export class OdcsDurabilityEngine {
  constructor(dbName = 'odcs_durability_db', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, this.version);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        // Outbox WAL Store
        if (!db.objectStoreNames.contains('outbox_wal')) {
          const outboxStore = db.createObjectStore('outbox_wal', { keyPath: 'id' });
          outboxStore.createIndex('status', 'status', { unique: false });
          outboxStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        // Entities Snapshot Store
        if (!db.objectStoreNames.contains('entities')) {
          const entityStore = db.createObjectStore('entities', { keyPath: 'id' });
          entityStore.createIndex('type', 'type', { unique: false });
        }
      };
      req.onsuccess = () => {
        this.db = req.result;
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  }

  // Atomically record mutation into WAL and update local snapshot
  async recordMutation({ entity, action, payload, nodeId }) {
    const mutation = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      nodeId,
      entity,
      action,
      payload,
      status: 'QUEUED_OUTBOX',
      retryCount: 0
    };

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['outbox_wal', 'entities'], 'readwrite');
      tx.objectStore('outbox_wal').add(mutation);
      
      // Update entity snapshot
      if (action === 'DELETE') {
        tx.objectStore('entities').delete(payload.id);
      } else {
        tx.objectStore('entities').put({ id: payload.id, type: entity, data: payload, updatedAt: mutation.timestamp });
      }

      tx.oncomplete = () => resolve(mutation);
      tx.onerror = () => reject(tx.error);
    });
  }

  async getPendingOutbox() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('outbox_wal', 'readonly');
      const index = tx.objectStore('outbox_wal').index('status');
      const req = index.getAll('QUEUED_OUTBOX');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async markSynced(mutationIds) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('outbox_wal', 'readwrite');
      const store = tx.objectStore('outbox_wal');
      for (const id of mutationIds) {
        store.delete(id); // Or update status to 'SYNCED'
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}
```

---

## 3. Layer 3 Implementation: Real-Time Telemetry & Environmental Sensor

```javascript
// odcs-layer3-runtime.js
export class OdcsRuntimeAdapter {
  constructor(probeUrl = '/api/health-probe') {
    this.probeUrl = probeUrl;
    this.mode = 'OPTIMAL_ONLINE';
    this.listeners = new Set();
    this.isProbing = false;
    
    // Bind hardware & network listeners
    window.addEventListener('online', () => this.evaluate());
    window.addEventListener('offline', () => this.setMode('AIRGAPPED_ISOLATED'));
  }

  onModeChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  setMode(newMode) {
    if (this.mode !== newMode) {
      const oldMode = this.mode;
      this.mode = newMode;
      for (const cb of this.listeners) cb(newMode, oldMode);
    }
  }

  async evaluate() {
    if (!navigator.onLine) {
      this.setMode('AIRGAPPED_ISOLATED');
      return;
    }
    
    const startTime = performance.now();
    try {
      // Lightweight active HTTP probe
      const res = await fetch(this.probeUrl, { method: 'HEAD', cache: 'no-store' });
      const rtt = performance.now() - startTime;
      
      if (res.ok) {
        if (rtt < 200) this.setMode('OPTIMAL_ONLINE');
        else if (rtt < 1000) this.setMode('CONSTRAINED_BANDWIDTH');
        else this.setMode('HIGH_LATENCY');
      } else {
        this.setMode('TRANSIENT_OFFLINE');
      }
    } catch {
      this.setMode('TRANSIENT_OFFLINE');
    }
  }
}
```

---

## 4. Layer 4 Implementation: Standard Continuity Status Indicator

```html
<!-- odcs-continuity-badge.html -->
<div id="odcs-indicator" class="odcs-badge odcs-synced" role="status" aria-live="polite">
  <span class="odcs-badge-dot"></span>
  <span class="odcs-badge-label">All Changes Synced</span>
</div>

<style>
.odcs-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.odcs-badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.odcs-synced { background: rgba(16, 185, 129, 0.12); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.3); }
.odcs-synced .odcs-badge-dot { background: #10B981; box-shadow: 0 0 8px #10B981; }

.odcs-buffered { background: rgba(245, 158, 11, 0.12); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.3); }
.odcs-buffered .odcs-badge-dot { background: #F59E0B; }

.odcs-syncing { background: rgba(0, 242, 254, 0.12); color: #00F2FE; border: 1px solid rgba(0, 242, 254, 0.3); }
.odcs-syncing .odcs-badge-dot { background: #00F2FE; animation: pulse 1.2s infinite; }
</style>
```

---

## 5. React Integration Hook Example

```typescript
import { useEffect, useState } from 'react';
import { OdcsClient } from './odcs-client';

export function useOdcsContinuity(client: OdcsClient) {
  const [status, setStatus] = useState(client.getStatus());

  useEffect(() => {
    return client.subscribeStatus((newStatus) => {
      setStatus(newStatus);
    });
  }, [client]);

  return status;
}
```

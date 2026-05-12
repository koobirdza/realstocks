// RealStock v51 — IndexedDB cache layer
// Backend / Google Sheet remains the source of truth. IndexedDB is only a local speed cache.

const DB_NAME = 'realstock_v51_cache';
const DB_VERSION = 1;
const STORE_NAME = 'kv';
const DEFAULT_TTL_MS = 5 * 60 * 1000;

let dbPromise = null;

function hasIndexedDB() {
  return typeof indexedDB !== 'undefined';
}

function openDb() {
  if (!hasIndexedDB()) return Promise.resolve(null);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
    req.onblocked = () => resolve(null);
  });

  return dbPromise;
}

async function withStore(mode, fn) {
  const db = await openDb();
  if (!db) return null;

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    let settled = false;

    function done(value) {
      if (settled) return;
      settled = true;
      resolve(value);
    }

    tx.onerror = () => done(null);
    tx.onabort = () => done(null);

    try {
      fn(store, done);
    } catch (err) {
      done(null);
    }
  });
}

export async function idbGet(key) {
  const record = await withStore('readonly', (store, done) => {
    const req = store.get(key);
    req.onsuccess = () => done(req.result || null);
    req.onerror = () => done(null);
  });

  if (!record) return null;
  if (record.expiresAt && Date.now() > Number(record.expiresAt)) {
    idbDelete(key);
    return null;
  }
  return record.value;
}

export async function idbSet(key, value, ttlMs = DEFAULT_TTL_MS) {
  await withStore('readwrite', (store, done) => {
    const req = store.put({
      key,
      value,
      savedAt: Date.now(),
      expiresAt: ttlMs ? Date.now() + ttlMs : 0
    });
    req.onsuccess = () => done(true);
    req.onerror = () => done(false);
  });
}

export async function idbDelete(key) {
  await withStore('readwrite', (store, done) => {
    const req = store.delete(key);
    req.onsuccess = () => done(true);
    req.onerror = () => done(false);
  });
}

export async function idbClearByPrefix(prefix = '') {
  await withStore('readwrite', (store, done) => {
    const req = store.openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) return done(true);
      if (!prefix || String(cursor.key).startsWith(prefix)) cursor.delete();
      cursor.continue();
    };
    req.onerror = () => done(false);
  });
}

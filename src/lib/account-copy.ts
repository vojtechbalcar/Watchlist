import type { Reconcile } from "./watchlist-sync";

type CopyStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** Browser behavior in production; controlled storage, requests, and time in tests. */
export type AccountCopyEnvironment = {
  storage: () => CopyStorage;
  fetch: typeof fetch;
  subscribe: (event: "storage" | "online", listener: (key: string | null) => void) => () => void;
  schedule: (task: () => void) => () => void;
};

const browser: AccountCopyEnvironment = {
  storage: () => localStorage,
  fetch: (...args) => fetch(...args),
  subscribe(event, listener) {
    if (event === "storage") {
      const onStorage = (change: StorageEvent) => listener(change.key);
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    }
    const onOnline = () => listener(null);
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  },
  schedule(task) {
    const timer = setTimeout(task, 400);
    return () => clearTimeout(timer);
  },
};

/**
 * One synchronous browser working copy, backed by a separate account copy.
 * Owns snapshots, notifications, durable unsent edits, and ordered uploads.
 * Storage failures never turn a failed user write into apparent success.
 */
export function createAccountCopy<T>({ key, ownerKey, endpoint, empty, parse, reconcile }: {
  key: string;
  ownerKey: string;
  endpoint: string;
  empty: T;
  parse: (raw: string | null) => T;
  reconcile: (input: Reconcile<T>) => { local: T; upload: T | null };
}, environment: AccountCopyEnvironment = browser) {
  const unsentKey = `${ownerKey}:unsent`;
  const listeners = new Set<() => void>();
  let cachedRaw: string | null | undefined;
  let snapshot = empty;
  let user: string | null = null;
  let generation = 0;
  let revision = 0;
  let synced = false;
  let editedBeforeLoad = false;
  let cancelPush: (() => void) | undefined;
  let load: Promise<void> | undefined;
  let uploading: { generation: number; promise: Promise<void> } | undefined;
  let unsubscribeOnline: (() => void) | undefined;
  let unsubscribeStorage: (() => void) | undefined;

  function stored(storageKey: string) {
    try { return environment.storage().getItem(storageKey); } catch { return undefined; }
  }

  function markUnsent(unsent: boolean) {
    try {
      if (unsent) environment.storage().setItem(unsentKey, "1");
      else environment.storage().removeItem(unsentKey);
    } catch { /* Blocked storage cannot persist across reloads. */ }
  }

  function notify() { listeners.forEach(listener => listener()); }

  function getSnapshot() {
    try {
      const raw = environment.storage().getItem(key);
      if (raw !== cachedRaw) {
        const owner = user ? environment.storage().getItem(ownerKey) : null;
        snapshot = user && owner !== null && owner !== user ? empty : parse(raw);
        cachedRaw = raw;
      }
    } catch { /* Keep the last known copy when reading is blocked. */ }
    return snapshot;
  }

  /** Account loads may still replace the in-memory copy when storage is blocked. */
  function replace(value: T, persist = true) {
    const raw = JSON.stringify(value);
    if (persist) {
      try { environment.storage().setItem(key, raw); } catch { /* Use memory for this visit. */ }
    }
    cachedRaw = stored(key);
    snapshot = value;
  }

  async function push() {
    if (!user || !synced || stored(ownerKey) !== user) return;
    const current = generation;
    if (uploading?.generation === current) return uploading.promise;
    const task = { generation: current, promise: Promise.resolve() };
    uploading = task;
    task.promise = (async () => {
      let sentRevision: number;
      do {
        if (current !== generation || stored(ownerKey) !== user) return;
        cancelPush?.();
        cancelPush = undefined;
        sentRevision = revision;
        const value = getSnapshot();
        const state = JSON.stringify(value);
        markUnsent(true);
        try {
          const response = await environment.fetch(endpoint, {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ state: value }), keepalive: true,
          });
          if (current === generation && stored(ownerKey) === user && response.ok && sentRevision === revision && JSON.stringify(getSnapshot()) === state) markUnsent(false);
        } catch { /* Retry on reconnect or the next edit, never in a failure loop. */ }
      } while (current === generation && sentRevision !== revision);
    })().finally(() => { if (uploading === task) uploading = undefined; });
    return task.promise;
  }

  function changed() {
    revision++;
    if (!user) return;
    // Persist before debounce: closing the page must not lose the unsent marker.
    markUnsent(true);
    if (!synced) { editedBeforeLoad = true; return; }
    cancelPush?.();
    cancelPush = environment.schedule(() => { cancelPush = undefined; void push(); });
  }

  function finish(userId: string, value: T, persist = true) {
    replace(value, persist);
    if (persist) {
      try { environment.storage().setItem(ownerKey, userId); } catch { /* Memory remains available. */ }
    }
    synced = true;
    notify();
  }

  function listenToStorage() {
    unsubscribeStorage ??= environment.subscribe("storage", changedKey => {
      if (changedKey !== key && changedKey !== ownerKey && changedKey !== null) return;
      const owner = stored(ownerKey);
      if (user && owner !== user && owner !== null) replace(empty, false);
      else if (user) {
        revision++;
        if (!synced) editedBeforeLoad = true;
      }
      notify();
    });
  }

  return {
    getSnapshot,
    getServerSnapshot: () => empty,
    isSynced: () => synced,
    subscribe(listener: () => void) {
      listeners.add(listener);
      listenToStorage();
      return () => {
        listeners.delete(listener);
        if (!listeners.size && !user) { unsubscribeStorage?.(); unsubscribeStorage = undefined; }
      };
    },
    /** Read storage again before writing; a fallback snapshot is never a write base. */
    update(update: (state: T) => T | null): boolean {
      try {
        const storage = environment.storage();
        if (user) {
          const owner = storage.getItem(ownerKey);
          if (owner !== null && owner !== user) return false;
        }
        const next = update(parse(storage.getItem(key)));
        if (next === null) return false;
        const raw = JSON.stringify(next);
        const value = parse(raw);
        storage.setItem(key, JSON.stringify(value));
        cachedRaw = JSON.stringify(value);
        snapshot = value;
      } catch { return false; }
      changed();
      notify();
      return true;
    },
    reset(): boolean {
      try {
        const storage = environment.storage();
        if (user && storage.getItem(ownerKey) !== user) return false;
        storage.removeItem(key);
      } catch { return false; }
      cachedRaw = null;
      snapshot = empty;
      changed();
      notify();
      return true;
    },
    start(userId: string): Promise<void> {
      if (user === userId) return load ?? Promise.resolve();
      const current = ++generation;
      user = userId;
      synced = false;
      cancelPush?.();
      cancelPush = undefined;
      const owner = stored(ownerKey);
      editedBeforeLoad = stored(unsentKey) === "1" && owner === userId;
      if (owner !== null && owner !== userId) {
        replace(empty, false);
        if (owner !== undefined) markUnsent(false);
      } else if (owner === null) {
        // An edit before GET finishes must still have an owner after a reload.
        try { environment.storage().setItem(ownerKey, userId); } catch { /* Storage unavailable. */ }
      }
      listenToStorage();
      unsubscribeOnline ??= environment.subscribe("online", () => {
        if (synced && stored(unsentKey) === "1") void push();
      });
      notify();
      load = (async () => {
        let server: T | null;
        try {
          const response = await environment.fetch(endpoint, { cache: "no-store", signal: AbortSignal.timeout(8000) });
          if (!response.ok) throw new Error(`Account copy answered ${response.status}`);
          const payload = await response.json() as { state: unknown };
          server = payload.state === null ? null : parse(JSON.stringify(payload.state));
        } catch {
          if (current === generation) {
            const currentOwner = stored(ownerKey);
            const changedOwner = currentOwner !== null && currentOwner !== userId && currentOwner !== owner;
            finish(userId, owner === null || owner === userId ? getSnapshot() : empty, currentOwner !== undefined && !changedOwner);
          }
          return;
        }
        if (current !== generation) return;
        const currentOwner = stored(ownerKey);
        if (currentOwner !== undefined && currentOwner !== null && currentOwner !== userId && currentOwner !== owner) {
          finish(userId, empty, false);
          return;
        }
        const { local, upload } = reconcile({ server, local: getSnapshot(), localOwner: owner ?? null, userId, editedBeforeLoad });
        finish(userId, local);
        if (upload !== null || (editedBeforeLoad && (owner === null || owner === userId))) await push();
      })();
      return load;
    },
  };
}

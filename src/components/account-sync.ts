"use client";

import type { Reconcile } from "@/lib/watchlist-sync";

/** After this, use the browser's copy rather than wait on a slow network. */
const LOAD_TIMEOUT_MS = 8000;
const PUSH_DELAY_MS = 400;

/**
 * Keeps something saved per account (the watchlist, preferences) in step with
 * the browser's copy. localStorage stays the working copy, so every change is
 * instant and other tabs see it; the account's copy at `endpoint` is what
 * other devices load. `reconcile` decides how the two meet on load.
 */
export function createAccountSync<T>({ endpoint, ownerKey, read, replace, reconcile, empty }: {
  endpoint: string;
  /** localStorage key naming the account the browser copy belongs to. */
  ownerKey: string;
  read: () => T;
  /** Replaces the browser copy and tells the page. */
  replace: (value: T) => void;
  reconcile: (input: Reconcile<T>) => { local: T; upload: T | null };
  empty: T;
}) {
  let user: string | null = null;
  let synced = false;
  let editedBeforeLoad = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const listeners = new Set<() => void>();

  async function push(value: T) {
    try {
      // keepalive lets a change made just before leaving the page still arrive.
      await fetch(endpoint, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state: value }), keepalive: true });
    } catch { /* The next change sends the whole copy again. */ }
  }

  function readOwner() {
    try { return localStorage.getItem(ownerKey); } catch { return null; }
  }

  function finish(userId: string, local: T) {
    if (JSON.stringify(local) !== JSON.stringify(read())) replace(local);
    try { localStorage.setItem(ownerKey, userId); } catch { /* Blocked storage: the page keeps working from memory. */ }
    synced = true;
    listeners.forEach(listener => listener());
  }

  return {
    /** Loads the account's copy once per signed-in user. */
    async start(userId: string) {
      if (user === userId) return;
      user = userId;
      synced = false;
      editedBeforeLoad = false;
      let server: T | null;
      try {
        const response = await fetch(endpoint, { cache: "no-store", signal: AbortSignal.timeout(LOAD_TIMEOUT_MS) });
        if (!response.ok) throw new Error(`${endpoint} answered ${response.status}`);
        server = ((await response.json()) as { state: T | null }).state;
      } catch {
        // Offline or slow: use this browser's copy if it is this account's; the next change saves it.
        const owner = readOwner();
        finish(userId, owner === null || owner === userId ? read() : empty);
        return;
      }
      const { local, upload } = reconcile({ server, local: read(), localOwner: readOwner(), userId, editedBeforeLoad });
      finish(userId, local);
      if (upload) await push(upload);
    },
    /** Call after every change to the browser copy. */
    changed() {
      if (!user) return;
      if (!synced) { editedBeforeLoad = true; return; }
      clearTimeout(timer);
      timer = setTimeout(() => void push(read()), PUSH_DELAY_MS);
    },
    isSynced: () => synced,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
  };
}

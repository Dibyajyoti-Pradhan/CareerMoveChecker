// Anonymous session — 30d expiry, stored in localStorage. First visit detected.

const KEY = 'cmc.sid';
const FIRST_VISIT_KEY = 'cmc.first';

function randomId(): string {
  const arr = new Uint8Array(16);
  (globalThis.crypto || (window as any).msCrypto).getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function getSessionId(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = randomId();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return 'no-storage';
  }
}

export function isFirstVisit(): boolean {
  try {
    if (localStorage.getItem(FIRST_VISIT_KEY)) return false;
    localStorage.setItem(FIRST_VISIT_KEY, new Date().toISOString());
    return true;
  } catch {
    return false;
  }
}

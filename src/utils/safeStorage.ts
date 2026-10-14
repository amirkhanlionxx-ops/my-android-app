// src/utils/safeStorage.ts
// Bulletproof storage wrapper that handles iframes, restricted WebViews, private browsing,
// and third-party cookie blocks without ever throwing DOMException or SecurityError.

class SafeStorage {
  private memFallback: Map<string, string> = new Map();
  private storageAvailable: boolean | null = null;

  private isAvailable(): boolean {
    if (this.storageAvailable !== null) return this.storageAvailable;
    if (typeof window === 'undefined') {
      this.storageAvailable = false;
      return false;
    }
    try {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      this.storageAvailable = true;
      return true;
    } catch {
      this.storageAvailable = false;
      return false;
    }
  }

  getItem(key: string): string | null {
    try {
      if (this.isAvailable()) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch {}
    return this.memFallback.get(key) || null;
  }

  setItem(key: string, value: string): void {
    try {
      if (this.isAvailable()) {
        window.localStorage.setItem(key, value);
      }
    } catch {}
    this.memFallback.set(key, value);
  }

  removeItem(key: string): void {
    try {
      if (this.isAvailable()) {
        window.localStorage.removeItem(key);
      }
    } catch {}
    this.memFallback.delete(key);
  }

  clear(): void {
    try {
      if (this.isAvailable()) {
        window.localStorage.clear();
      }
    } catch {}
    this.memFallback.clear();
  }

  getAllKeys(): string[] {
    const keys = new Set<string>();
    try {
      if (this.isAvailable()) {
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k) keys.add(k);
        }
      }
    } catch {}
    this.memFallback.forEach((_, k) => keys.add(k));
    return Array.from(keys);
  }
}

export const safeStorage = new SafeStorage();

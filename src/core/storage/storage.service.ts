import type { IStorage } from "./storage.interface";

/**
 * Storage implementation that prioritizes chrome.storage.local
 * with fallback to localStorage when running in non-extension environments (e.g. Vite dev).
 */
export class StorageService implements IStorage {
  private hasChromeStorage(): boolean {
    return (
      typeof chrome !== "undefined" &&
      Boolean(chrome?.storage?.local)
    );
  }

  async get<T>(key: string, defaultValue: T): Promise<T> {
    if (this.hasChromeStorage()) {
      return new Promise<T>((resolve) => {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError) {
            console.error("chrome.storage get error:", chrome.runtime.lastError);
            resolve(defaultValue);
            return;
          }
          if (result && result[key] !== undefined) {
            resolve(result[key] as T);
          } else {
            resolve(defaultValue);
          }
        });
      });
    }

    // Fallback: localStorage
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch (e) {
      console.error(`Failed to parse localStorage key "${key}":`, e);
      return defaultValue;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (this.hasChromeStorage()) {
      return new Promise<void>((resolve, reject) => {
        chrome.storage.local.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
            console.error("chrome.storage set error:", chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
            return;
          }
          resolve();
        });
      });
    }

    // Fallback: localStorage
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to set localStorage key "${key}":`, e);
    }
  }

  async remove(key: string): Promise<void> {
    if (this.hasChromeStorage()) {
      return new Promise<void>((resolve) => {
        chrome.storage.local.remove([key], () => resolve());
      });
    }

    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    if (this.hasChromeStorage()) {
      return new Promise<void>((resolve) => {
        chrome.storage.local.clear(() => resolve());
      });
    }

    localStorage.clear();
  }
}

export const storage = new StorageService();

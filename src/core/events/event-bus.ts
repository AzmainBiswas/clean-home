import type { BgCss, BookmarkItem, SearchPosition } from "../config/types";

export type EventPayloads = {
  "config:changed": { key: string; value: unknown };
  "wallpaper:updated": { blobUrl: string };
  "wallpaper:filters-changed": BgCss;
  "search:focus": void;
  "search:select-engine": string;
  "search:position-changed": SearchPosition;
  "search:visibility-changed": boolean;
  "element:blur-changed": number;
  "bookmarks:updated": BookmarkItem[];
  "bookmarks:visibility-changed": boolean;
  "bookmarks:columns-changed": number;
};

type EventHandler<T> = (payload: T) => void;

/**
 * Lightweight, type-safe PubSub Event Bus for cross-feature communication.
 */
export class EventBus {
  private static listeners = new Map<string, Set<EventHandler<any>>>();

  static on<K extends keyof EventPayloads>(
    event: K,
    handler: EventHandler<EventPayloads[K]>,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  static off<K extends keyof EventPayloads>(
    event: K,
    handler: EventHandler<EventPayloads[K]>,
  ): void {
    this.listeners.get(event)?.delete(handler);
  }

  static emit<K extends keyof EventPayloads>(
    event: K,
    payload: EventPayloads[K],
  ): void {
    this.listeners.get(event)?.forEach((handler) => {
      try {
        handler(payload);
      } catch (err) {
        console.error(`Error in EventBus handler for event "${event}":`, err);
      }
    });
  }

  static clear(): void {
    this.listeners.clear();
  }
}

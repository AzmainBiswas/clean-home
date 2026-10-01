import { storage } from "../storage/storage.service";
import { DEFAULT_CONFIG } from "./default-config";
import type { AppConfig, BgCss, BookmarkItem, SearchEngines, SearchPosition } from "./types";
import { EventBus } from "../events/event-bus";

const CONFIG_STORAGE_KEY = "config";

export class ConfigService {
  private config: AppConfig = { ...DEFAULT_CONFIG };
  private initialized = false;

  async init(): Promise<AppConfig> {
    if (this.initialized) return this.config;

    const stored = await storage.get<AppConfig | null>(CONFIG_STORAGE_KEY, null);
    if (stored) {
      // Merge with default to guarantee new fields are present if schemas evolve
      this.config = {
        ...DEFAULT_CONFIG,
        ...stored,
        bgCss: { ...DEFAULT_CONFIG.bgCss, ...(stored.bgCss || {}) },
        searchEngines: { ...DEFAULT_CONFIG.searchEngines, ...(stored.searchEngines || {}) },
        elementBlur:
          typeof stored.elementBlur === "number"
            ? stored.elementBlur
            : DEFAULT_CONFIG.elementBlur,
        searchPosition:
          stored.searchPosition === "top" ||
          stored.searchPosition === "middle" ||
          stored.searchPosition === "bottom"
            ? stored.searchPosition
            : DEFAULT_CONFIG.searchPosition,
        showSearchBar:
          typeof stored.showSearchBar === "boolean"
            ? stored.showSearchBar
            : DEFAULT_CONFIG.showSearchBar,
        showBookmarks:
          typeof stored.showBookmarks === "boolean"
            ? stored.showBookmarks
            : DEFAULT_CONFIG.showBookmarks,
        bookmarkColumns:
          typeof stored.bookmarkColumns === "number" && stored.bookmarkColumns >= 1
            ? stored.bookmarkColumns
            : DEFAULT_CONFIG.bookmarkColumns,
        bookmarks: Array.isArray(stored.bookmarks)
          ? stored.bookmarks
          : [...DEFAULT_CONFIG.bookmarks],
      };
    } else {
      this.config = { ...DEFAULT_CONFIG };
      await storage.set(CONFIG_STORAGE_KEY, this.config);
    }

    this.initialized = true;
    return this.config;
  }

  getConfig(): AppConfig {
    return this.config;
  }

  getSearchEngines(): SearchEngines {
    return this.config.searchEngines;
  }

  getDefaultSearch(): string {
    return this.config.defaultSearchEngine;
  }

  getBgCss(): BgCss {
    return this.config.bgCss;
  }

  async setBgCss(css: BgCss): Promise<void> {
    this.config.bgCss = css;
    await storage.set(CONFIG_STORAGE_KEY, this.config);
    EventBus.emit("wallpaper:filters-changed", css);
    EventBus.emit("config:changed", { key: "bgCss", value: css });
  }

  async setDefaultSearchEngine(engineId: string): Promise<void> {
    this.config.defaultSearchEngine = engineId;
    await storage.set(CONFIG_STORAGE_KEY, this.config);
    EventBus.emit("config:changed", { key: "defaultSearchEngine", value: engineId });
  }

  getElementBlur(): number {
    return this.config.elementBlur ?? DEFAULT_CONFIG.elementBlur;
  }

  async setElementBlur(blur: number): Promise<void> {
    this.config.elementBlur = blur;
    await storage.set(CONFIG_STORAGE_KEY, this.config);
    EventBus.emit("element:blur-changed", blur);
    EventBus.emit("config:changed", { key: "elementBlur", value: blur });
  }

  getSearchPosition(): SearchPosition {
    return this.config.searchPosition ?? DEFAULT_CONFIG.searchPosition;
  }

  async setSearchPosition(position: SearchPosition): Promise<void> {
    this.config.searchPosition = position;
    await storage.set(CONFIG_STORAGE_KEY, this.config);
    EventBus.emit("search:position-changed", position);
    EventBus.emit("config:changed", { key: "searchPosition", value: position });
  }

  getShowSearchBar(): boolean {
    return this.config.showSearchBar ?? DEFAULT_CONFIG.showSearchBar;
  }

  async setShowSearchBar(show: boolean): Promise<void> {
    this.config.showSearchBar = show;
    await storage.set(CONFIG_STORAGE_KEY, this.config);
    EventBus.emit("search:visibility-changed", show);
    EventBus.emit("config:changed", { key: "showSearchBar", value: show });
  }

  getShowBookmarks(): boolean {
    return this.config.showBookmarks ?? DEFAULT_CONFIG.showBookmarks;
  }

  async setShowBookmarks(show: boolean): Promise<void> {
    this.config.showBookmarks = show;
    await storage.set(CONFIG_STORAGE_KEY, this.config);
    EventBus.emit("bookmarks:visibility-changed", show);
    EventBus.emit("config:changed", { key: "showBookmarks", value: show });
  }

  getBookmarkColumns(): number {
    return this.config.bookmarkColumns ?? DEFAULT_CONFIG.bookmarkColumns;
  }

  async setBookmarkColumns(columns: number): Promise<void> {
    this.config.bookmarkColumns = columns;
    await storage.set(CONFIG_STORAGE_KEY, this.config);
    EventBus.emit("bookmarks:columns-changed", columns);
    EventBus.emit("config:changed", { key: "bookmarkColumns", value: columns });
  }

  getBookmarks(): BookmarkItem[] {
    return this.config.bookmarks ?? DEFAULT_CONFIG.bookmarks;
  }

  async setBookmarks(bookmarks: BookmarkItem[]): Promise<void> {
    this.config.bookmarks = bookmarks;
    await storage.set(CONFIG_STORAGE_KEY, this.config);
    EventBus.emit("bookmarks:updated", bookmarks);
    EventBus.emit("config:changed", { key: "bookmarks", value: bookmarks });
  }

  async addBookmark(title: string, rawUrl: string): Promise<BookmarkItem> {
    let url = rawUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    const item: BookmarkItem = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      title: title.trim() || url.replace(/^https?:\/\//, "").split("/")[0],
      url,
    };
    const current = this.getBookmarks();
    await this.setBookmarks([...current, item]);
    return item;
  }

  async removeBookmark(id: string): Promise<void> {
    const current = this.getBookmarks();
    await this.setBookmarks(current.filter((b) => b.id !== id));
  }

  async updateConfig(partial: Partial<AppConfig>): Promise<void> {
    this.config = { ...this.config, ...partial };
    await storage.set(CONFIG_STORAGE_KEY, this.config);
    EventBus.emit("config:changed", { key: "root", value: this.config });
  }
}

export const configService = new ConfigService();

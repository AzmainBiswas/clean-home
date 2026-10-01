export interface SearchEngine {
  name: string;
  url: string;
}

export type SearchEngines = Record<string, SearchEngine>;

export interface BgCss {
  blur: number;
  scale: number;
  brightness: number;
}

export type SearchPosition = "top" | "middle" | "bottom";

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
}

export interface AppConfig {
  defaultSearchEngine: string;
  searchEngines: SearchEngines;
  bgCss: BgCss;
  elementBlur: number;
  searchPosition: SearchPosition;
  showSearchBar: boolean;
  showBookmarks: boolean;
  bookmarkColumns: number;
  bookmarks: BookmarkItem[];
}

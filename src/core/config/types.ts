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

export interface AppConfig {
  defaultSearchEngine: string;
  searchEngines: SearchEngines;
  bgCss: BgCss;
  elementBlur: number;
}

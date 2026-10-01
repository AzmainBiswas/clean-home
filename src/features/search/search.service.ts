import { configService } from "../../core/config/config.service";

export interface SortedEngineItem {
  key: string;
  name: string;
  url: string;
}

export class SearchService {
  getSortedEngines(): SortedEngineItem[] {
    const engines = configService.getSearchEngines();
    const defaultId = configService.getDefaultSearch();

    return Object.keys(engines)
      .sort((a, b) => {
        if (a === defaultId) return -1;
        if (b === defaultId) return 1;
        return engines[a].name.localeCompare(engines[b].name);
      })
      .map((key) => ({
        key,
        name: engines[key].name,
        url: engines[key].url,
      }));
  }

  executeSearch(engineKey: string, query: string): void {
    const engines = configService.getSearchEngines();
    const engine = engines[engineKey];
    if (!engine || !query.trim()) return;

    const fullUrl = engine.url.replace("%s", encodeURIComponent(query.trim()));
    window.location.href = fullUrl;
  }
}

export const searchService = new SearchService();

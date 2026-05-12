import defaultConfig from "../assets/default-setting.json";

export type SearchEngine = {
  name: string;
  url: string;
};
export type SearchEngines = Record<string, SearchEngine>;
type BgCss = {
  blur: number,
  scale: number,
  brightness: number
}

interface AppConfig {
  defaultSearchEngine: string,
  searchEngines: SearchEngines,
  bgCss: BgCss,
}

function getConfig() {
  let configStr = localStorage.getItem("config");
  if (configStr) {
    return JSON.parse(configStr) as AppConfig;
  }
  localStorage.setItem("config", JSON.stringify(defaultConfig));
  return defaultConfig as AppConfig;
}

function setConfig(config: AppConfig) {
  localStorage.setItem("config", JSON.stringify(config));
}
export function getSearchEngines(): SearchEngines {
  const config = getConfig();
  return config.searchEngines;
}

export function getDefaultSearch(): string {
  const config = getConfig();
  return config.defaultSearchEngine;
}

export function getBgCss(): BgCss {
  const config = getConfig();
  return config.bgCss;
}

export function setBgCss(css: BgCss) {
  const config = getConfig();
  config.bgCss = css;
  setConfig(config);
}

export function setDefaultSearchEngine(engine: string) {
  const config = getConfig();
  config.defaultSearchEngine = engine;
  setConfig(config);
}

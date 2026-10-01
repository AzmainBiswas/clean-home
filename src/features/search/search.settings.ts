import { configService } from "../../core/config/config.service";
import { createElement } from "../../shared/dom/dom";
import { searchService } from "./search.service";

export function createSearchSettings(): HTMLElement {
  const container = createElement("div", { className: "container" });

  const label = createElement("label", {
    htmlFor: "default-search-selector",
    textContent: "Choose Search Engine",
  });

  const select = createElement("select", {
    id: "default-search-selector",
  });

  const sorted = searchService.getSortedEngines();
  const defaultEngine = configService.getDefaultSearch();

  sorted.forEach((item) => {
    const option = createElement("option", {
      value: item.key,
      textContent: item.name,
    });
    if (item.key === defaultEngine) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  select.addEventListener("change", () => {
    configService.setDefaultSearchEngine(select.value);
  });

  container.append(label, select);
  return container;
}

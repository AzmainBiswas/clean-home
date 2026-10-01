import { configService } from "../../core/config/config.service";
import { attachScrollToRange, createElement } from "../../shared/dom/dom";
import { searchService } from "./search.service";

export function createSearchSettings(): HTMLElement {
  const wrapper = createElement("div", { id: "search-options" });

  // 1. Search Engine Selector
  const engineContainer = createElement("div", { className: "container" });
  const engineLabel = createElement("label", {
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
  engineContainer.append(engineLabel, select);

  // 2. Search Box & Element Blur Slider (controls blur across all UI elements)
  const blurContainer = createElement("div", { className: "container" });
  const currentBlur = configService.getElementBlur();

  const blurLabel = createElement("label", {
    htmlFor: "element-blur-range",
    textContent: "Search & UI Blur",
  });

  const blurInput = createElement("input", {
    id: "element-blur-range",
    type: "range",
    min: "0",
    max: "30",
    step: "1",
    value: `${currentBlur}`,
  });

  blurInput.addEventListener("input", (e) => {
    const val = parseFloat((e.target as HTMLInputElement).value);
    configService.setElementBlur(val);
  });

  attachScrollToRange(blurInput);
  blurContainer.append(blurLabel, blurInput);

  wrapper.append(engineContainer, blurContainer);
  return wrapper;
}

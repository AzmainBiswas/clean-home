import { configService } from "../../core/config/config.service";
import type { SearchPosition } from "../../core/config/types";
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
    className: "settings-select",
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

  // 3. Search Bar Position Selector
  const positionContainer = createElement("div", { className: "container" });
  const positionLabel = createElement("label", {
    htmlFor: "search-position-selector",
    textContent: "Search Bar Position",
  });
  const positionSelect = createElement("select", {
    id: "search-position-selector",
    className: "settings-select",
  });

  const positions: { key: SearchPosition; label: string }[] = [
    { key: "top", label: "Top" },
    { key: "middle", label: "Middle" },
    { key: "bottom", label: "Bottom" },
  ];
  const currentPos = configService.getSearchPosition();

  positions.forEach((pos) => {
    const opt = createElement("option", {
      value: pos.key,
      textContent: pos.label,
    });
    if (pos.key === currentPos) {
      opt.selected = true;
    }
    positionSelect.appendChild(opt);
  });

  positionSelect.addEventListener("change", () => {
    configService.setSearchPosition(positionSelect.value as SearchPosition);
  });
  positionContainer.append(positionLabel, positionSelect);

  wrapper.append(engineContainer, blurContainer, positionContainer);
  return wrapper;
}

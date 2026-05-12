import "./background.ts";
import { backgroundSelector } from "./background.ts";
import { createOptions as createSearchEngineOptions } from "./search-section.ts";
import { setDefaultSearchEngine } from "./utills/config.ts";
import { createElement } from "./utills/dom.ts";

const backgroundSettings = document.getElementById("background-settings");
backgroundSettings?.append(backgroundSelector());

const searchSettings = document.getElementById("search-settings");
searchSettings?.appendChild(createSearchSettings())

function createSearchSettings() {
  const select = createElement("select", {
    id: "default-search-selector",
  });
  createSearchEngineOptions(select);
  select.addEventListener("change", () => {
    setDefaultSearchEngine(select.value);
  })

  return select
}

import { configService } from "../../core/config/config.service";
import type { SearchPosition } from "../../core/config/types";
import { EventBus } from "../../core/events/event-bus";
import { createElement } from "../../shared/dom/dom";
import { searchService } from "./search.service";

export class SearchView {
  private form: HTMLFormElement | null = null;
  private select: HTMLSelectElement | null = null;
  private input: HTMLInputElement | null = null;

  render(): HTMLElement {
    this.form = createElement("form", { id: "search-form" });
    this.applyPosition(configService.getSearchPosition());
    this.applyVisibility(configService.getShowSearchBar());

    this.select = createElement("select", {
      name: "search-engines",
      id: "search-engine-select",
    });

    this.input = createElement("input", {
      id: "search-input",
      name: "search-query",
      placeholder: "Search...",
      type: "text",
      required: true,
      autocomplete: "off",
    });

    const submitBtn = createElement("input", {
      type: "submit",
      value: "Submit",
    });

    this.populateEngines();

    this.form.append(this.select, this.input, submitBtn);

    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!this.select || !this.input) return;
      const engineKey = this.select.value;
      const query = this.input.value;
      searchService.executeSearch(engineKey, query);
    });

    // Listen to EventBus commands
    EventBus.on("search:focus", () => {
      if (configService.getShowSearchBar()) {
        this.input?.focus();
      }
    });

    EventBus.on("search:select-engine", (engineKey) => {
      if (!configService.getShowSearchBar()) return;
      if (this.select) {
        this.select.value = engineKey;
      }
      this.input?.focus();
    });

    EventBus.on("search:position-changed", (newPos) => {
      this.applyPosition(newPos);
    });

    EventBus.on("search:visibility-changed", (visible) => {
      this.applyVisibility(visible);
    });

    return this.form;
  }

  private applyVisibility(visible: boolean): void {
    if (!this.form) return;
    this.form.style.display = visible ? "flex" : "none";
  }

  private applyPosition(pos: SearchPosition): void {
    if (!this.form) return;
    this.form.classList.remove("pos-top", "pos-middle", "pos-bottom");
    this.form.classList.add(`pos-${pos}`);
  }

  private populateEngines(): void {
    if (!this.select) return;
    this.select.innerHTML = "";

    const sorted = searchService.getSortedEngines();
    sorted.forEach((item) => {
      const option = createElement("option", {
        value: item.key,
        textContent: item.name,
      });
      option.dataset.url = item.url;
      this.select!.appendChild(option);
    });
  }
}

export const searchView = new SearchView();

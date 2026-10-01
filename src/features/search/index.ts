import type { ExtensionFeature } from "../../core/types/feature";
import { EventBus } from "../../core/events/event-bus";
import { shortcutManager } from "../../core/shortcuts/shortcut-manager";
import { searchView } from "./search.view";
import { createSearchSettings } from "./search.settings";

export const SearchFeature: ExtensionFeature = {
  meta: {
    id: "search",
    name: "Search Bar",
    description: "Multi-engine web search with customizable default engine and shortcuts",
  },

  init(): void {
    // Register search-related shortcuts
    shortcutManager.register({
      id: "search:focus",
      description: "Focus search input",
      combo: { key: " ", ctrlOrMeta: true },
      allowInInputs: true,
      action: () => EventBus.emit("search:focus", undefined as void),
    });

    shortcutManager.register({
      id: "search:select-google",
      description: "Switch to Google search",
      combo: { key: "g", ctrlOrMeta: true },
      allowInInputs: true,
      action: () => EventBus.emit("search:select-engine", "google"),
    });

    shortcutManager.register({
      id: "search:select-no-ai-google",
      description: "Switch to AI Free Google search",
      combo: { key: "g", ctrlOrMeta: true, shift: true },
      allowInInputs: true,
      action: () => EventBus.emit("search:select-engine", "no-ai-google"),
    });

    shortcutManager.register({
      id: "search:blur",
      description: "Blur active input or search bar",
      combo: { key: "Escape" },
      allowInInputs: true,
      action: () => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      },
    });
  },

  renderWidget(): HTMLElement {
    return searchView.render();
  },

  renderSettings(): HTMLElement {
    return createSearchSettings();
  },
};

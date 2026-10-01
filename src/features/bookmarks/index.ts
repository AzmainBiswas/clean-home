import type { ExtensionFeature } from "../../core/types/feature";
import { bookmarksView } from "./bookmarks.view";
import { createBookmarksSettings } from "./bookmarks.settings";

export const BookmarksFeature: ExtensionFeature = {
  meta: {
    id: "bookmarks",
    name: "Bookmarks Grid",
    description: "Quick links and bookmarks grid with custom column layout",
  },

  init(): void {
    // Initialization lifecycle (state already managed in configService)
  },

  renderWidget(): HTMLElement {
    return bookmarksView.render();
  },

  renderSettings(): HTMLElement {
    return createBookmarksSettings();
  },
};

import type { ExtensionFeature } from "../../core/types/feature";
import { EventBus } from "../../core/events/event-bus";
import { shortcutManager } from "../../core/shortcuts/shortcut-manager";
import { directUrlView } from "./direct-url.view";

export const DirectUrlFeature: ExtensionFeature = {
  meta: {
    id: "direct-url",
    name: "Direct URL Launcher",
    description: "Floating popup input to navigate directly to any web URL",
  },

  init(): void {
    // Listen to direct-url:open event
    EventBus.on("direct-url:open", () => {
      directUrlView.open();
    });

    // Register shortcut Ctrl/Meta + u
    shortcutManager.register({
      id: "direct-url:open",
      description: "Open Direct URL launcher",
      combo: { key: "u", ctrlOrMeta: true },
      allowInInputs: false,
      action: () => directUrlView.open(),
    });
  },
};

import "./settings.css";
import { configService } from "./core/config/config.service";
import { features } from "./features";

async function bootstrapSettings(): Promise<void> {
  // 1. Initialize configuration
  await configService.init();

  // 2. Initialize registered features (e.g. Wallpaper sets up background preview)
  for (const feature of features) {
    try {
      await feature.init();
    } catch (err) {
      console.error(`Failed to initialize feature "${feature.meta.id}":`, err);
    }
  }

  // 3. Mount settings panels for each feature
  const settingsContainer = document.getElementById("settings");
  const backgroundSlot = document.getElementById("background-settings");
  const searchSlot = document.getElementById("search-settings");

  for (const feature of features) {
    const panel = feature.renderSettings?.();
    if (!panel) continue;

    if (feature.meta.id === "wallpaper" && backgroundSlot) {
      backgroundSlot.appendChild(panel);
    } else if (feature.meta.id === "search" && searchSlot) {
      searchSlot.appendChild(panel);
    } else if (settingsContainer) {
      settingsContainer.appendChild(panel);
    }
  }
}

bootstrapSettings().catch((err) => {
  console.error("Failed to bootstrap settings page:", err);
});

import "./style.css";
import { EventBus } from "./core/events/event-bus";
import { configService } from "./core/config/config.service";
import { features } from "./features";

async function bootstrapDashboard(): Promise<void> {
  // 1. Initialize configuration & CSS variables
  await configService.init();
  const applyElementBlur = (blur: number) => {
    document.documentElement.style.setProperty("--element-blur", `${blur}px`);
  };
  applyElementBlur(configService.getElementBlur());
  EventBus.on("element:blur-changed", (blur) => applyElementBlur(blur));

  // 2. Initialize all registered features
  for (const feature of features) {
    try {
      await feature.init();
    } catch (err) {
      console.error(`Failed to initialize feature "${feature.meta.id}":`, err);
    }
  }

  // 3. Mount widgets into the newtab dashboard container
  const dashboardContainer = document.querySelector<HTMLDivElement>("#new-tab");
  if (dashboardContainer) {
    for (const feature of features) {
      const widget = feature.renderWidget?.();
      if (widget) {
        dashboardContainer.appendChild(widget);
      }
    }
  }
}

bootstrapDashboard().catch((err) => {
  console.error("Failed to bootstrap dashboard:", err);
});

import { configService } from "../../core/config/config.service";
import type { BgCss } from "../../core/config/types";
import { EventBus } from "../../core/events/event-bus";
import { wallpaperService } from "./wallpaper.service";

let currentObjectUrl: string | null = null;

export class WallpaperView {
  private container: HTMLElement | null = null;

  init(): void {
    this.container = document.getElementById("bg-container");
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "bg-container";
      document.body.prepend(this.container);
    }

    this.applyCssFilters(configService.getBgCss());
    this.loadAndDisplayBackground();

    // React to filter updates from EventBus
    EventBus.on("wallpaper:filters-changed", (css) => {
      this.applyCssFilters(css);
    });

    // React to new image saved
    EventBus.on("wallpaper:updated", () => {
      this.loadAndDisplayBackground();
    });
  }

  applyCssFilters(css: BgCss): void {
    if (!this.container) return;
    this.container.style.setProperty("--bg-blur", `${css.blur || 0}px`);
    this.container.style.setProperty("--bg-brightness", `${css.brightness}`);
    this.container.style.setProperty("--bg-scale", `${css.scale}`);
  }

  async loadAndDisplayBackground(): Promise<void> {
    if (!this.container) return;

    try {
      const blob = await wallpaperService.getBackground();
      if (blob) {
        if (currentObjectUrl) {
          URL.revokeObjectURL(currentObjectUrl);
        }
        currentObjectUrl = URL.createObjectURL(blob);
        this.container.style.backgroundImage = `url("${currentObjectUrl}")`;
      } else {
        // Fallback default background
        this.container.style.backgroundImage = "none";
        this.container.style.backgroundColor = "#121214";
      }
    } catch (err) {
      console.error("Failed to load background:", err);
    }
  }
}

export const wallpaperView = new WallpaperView();

import type { ExtensionFeature } from "../../core/types/feature";
import { wallpaperView } from "./wallpaper.view";
import { createWallpaperSettings } from "./wallpaper.settings";

export const WallpaperFeature: ExtensionFeature = {
  meta: {
    id: "wallpaper",
    name: "Wallpaper & Visuals",
    description: "Custom wallpaper with blur, brightness, and scale controls",
  },

  init(): void {
    wallpaperView.init();
  },

  renderSettings(): HTMLElement {
    return createWallpaperSettings();
  },
};

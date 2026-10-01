import type { ExtensionFeature } from "../core/types/feature";
import { WallpaperFeature } from "./wallpaper";
import { SearchFeature } from "./search";
import { DirectUrlFeature } from "./direct-url";

/**
 * Registry of all available features in Clean Home.
 * New features (e.g. Clock, Weather, Bookmarks) can simply be imported
 * and appended to this array.
 */
export const features: ExtensionFeature[] = [
  WallpaperFeature,
  SearchFeature,
  DirectUrlFeature,
];

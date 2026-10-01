import { configService } from "../../core/config/config.service";
import type { BookmarkItem } from "../../core/config/types";
import { EventBus } from "../../core/events/event-bus";
import { createElement } from "../../shared/dom/dom";
import { bookmarksService } from "./bookmarks.service";

export class BookmarksView {
  private container: HTMLElement | null = null;

  render(): HTMLElement {
    this.container = createElement("div", { id: "bookmarks-container" });

    this.updatePosition();
    this.updateColumns(configService.getBookmarkColumns());
    this.updateVisibility(configService.getShowBookmarks());
    this.renderTiles(configService.getBookmarks());

    // Event Bus subscriptions for real-time reactivity
    EventBus.on("bookmarks:updated", (bookmarks) => {
      this.renderTiles(bookmarks);
    });

    EventBus.on("bookmarks:visibility-changed", (visible) => {
      this.updateVisibility(visible);
    });

    EventBus.on("bookmarks:columns-changed", (cols) => {
      this.updateColumns(cols);
    });

    EventBus.on("search:position-changed", () => {
      this.updatePosition();
    });

    EventBus.on("search:visibility-changed", () => {
      this.updatePosition();
    });

    return this.container;
  }

  private updateVisibility(visible: boolean): void {
    if (!this.container) return;
    this.container.style.display = visible ? "grid" : "none";
  }

  private updateColumns(columns: number): void {
    if (!this.container) return;
    this.container.style.setProperty("--bookmark-columns", `${columns}`);
  }

  private updatePosition(): void {
    if (!this.container) return;

    this.container.classList.remove(
      "search-top",
      "search-middle",
      "search-bottom",
      "search-hidden",
    );

    const isSearchVisible = configService.getShowSearchBar();
    if (!isSearchVisible) {
      this.container.classList.add("search-hidden");
      return;
    }

    const searchPos = configService.getSearchPosition();
    this.container.classList.add(`search-${searchPos}`);
  }

  private renderTiles(bookmarks: BookmarkItem[]): void {
    if (!this.container) return;
    this.container.innerHTML = "";

    if (bookmarks.length === 0) return;

    for (const item of bookmarks) {
      const tile = createElement("a", {
        className: "bookmark-tile",
        href: item.url,
        title: item.title,
      });

      const iconContainer = createElement("div", { className: "bookmark-icon-wrapper" });
      const faviconUrl = bookmarksService.getFaviconUrl(item.url);

      if (faviconUrl) {
        const img = createElement("img", {
          className: "bookmark-icon",
          src: faviconUrl,
          alt: item.title,
          loading: "lazy",
        });

        // Graceful fallback to initial letter if favicon fails to load
        img.onerror = () => {
          img.remove();
          const fallback = createElement("span", {
            className: "bookmark-fallback-icon",
            textContent: item.title.charAt(0).toUpperCase() || "✦",
          });
          iconContainer.appendChild(fallback);
        };

        iconContainer.appendChild(img);
      } else {
        const fallback = createElement("span", {
          className: "bookmark-fallback-icon",
          textContent: item.title.charAt(0).toUpperCase() || "✦",
        });
        iconContainer.appendChild(fallback);
      }

      const label = createElement("span", {
        className: "bookmark-title",
        textContent: item.title,
      });

      tile.append(iconContainer, label);
      this.container.appendChild(tile);
    }
  }
}

export const bookmarksView = new BookmarksView();

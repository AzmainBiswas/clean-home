export class BookmarksService {
  /**
   * Generates a high-resolution favicon URL for a given target website.
   * Uses Google's standard public favicon service with fallback safety.
   */
  getFaviconUrl(url: string): string {
    try {
      const parsed = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(parsed.hostname)}&sz=64`;
    } catch {
      return "";
    }
  }

  /**
   * Formats a clean display domain string if title is not provided.
   */
  getDisplayDomain(url: string): string {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  }
}

export const bookmarksService = new BookmarksService();

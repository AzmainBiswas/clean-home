export class DirectUrlService {
  normalizeAndNavigate(rawUrl: string): void {
    let url = rawUrl.trim();
    if (!url) return;

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    window.location.href = url;
  }
}

export const directUrlService = new DirectUrlService();

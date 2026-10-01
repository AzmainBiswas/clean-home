import { createElement } from "../../shared/dom/dom";
import { directUrlService } from "./direct-url.service";

export class DirectUrlView {
  open(): void {
    if (document.getElementById("direct-url-input")) return;

    const urlInput = createElement("input", {
      id: "direct-url-input",
      className: "direct-url-input",
      placeholder: "Enter URL and press Enter...",
      type: "text",
      required: true,
      autocomplete: "off",
    });

    document.body.appendChild(urlInput);
    urlInput.focus();

    urlInput.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        directUrlService.normalizeAndNavigate(urlInput.value);
        urlInput.remove();
      } else if (e.key === "Escape") {
        e.preventDefault();
        urlInput.remove();
      }
    });

    urlInput.addEventListener("blur", () => {
      // Remove if user clicks away
      setTimeout(() => {
        if (document.body.contains(urlInput)) {
          urlInput.remove();
        }
      }, 200);
    });
  }
}

export const directUrlView = new DirectUrlView();

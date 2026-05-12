import { createElement } from "./utills/dom";

export function createDirecturlInput(): void {
  if (document.getElementById("direct-url-input")) return;

  const urlInput = createElement("input", {
    id: "direct-url-input",
    className: "direct-url-input",
    placeholder: "Enter URL and press Enter...",
    type: "text",
    required: true,
  });

  document.body.appendChild(urlInput);
  urlInput.focus();

  urlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      let url = urlInput.value.trim();
      if (url) {
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          url = "https://" + url;
        }
        window.location.href = url;
      }
      urlInput.remove();
    } else if (e.key === "Escape") {
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

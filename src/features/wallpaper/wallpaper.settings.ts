import { configService } from "../../core/config/config.service";
import { EventBus } from "../../core/events/event-bus";
import { attachScrollToRange, createElement } from "../../shared/dom/dom";
import { wallpaperService } from "./wallpaper.service";

export function createWallpaperSettings(): HTMLElement {
  const bgCss = { ...configService.getBgCss() };

  const container = createElement("div", { id: "background-options" });

  // 1. Image selector
  const imageContainer = createElement("div", { className: "container" });
  const imageInput = createElement("input", {
    id: "background-selector",
    type: "file",
    accept: "image/*",
  });
  const imageLabel = createElement("label", {
    htmlFor: "background-selector",
    textContent: "Choose Background Photo",
  });
  imageContainer.append(imageLabel, imageInput);

  imageInput.addEventListener("change", async (e) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      try {
        const webpBlob = await wallpaperService.convertImageToWebp(file);
        await wallpaperService.saveBackground(webpBlob);
        EventBus.emit("wallpaper:updated", { blobUrl: "" });
      } catch (err) {
        console.error("Failed to process background image:", err);
      }
    }
  });

  // 2. Blur slider
  const blurContainer = createElement("div", { className: "container" });
  const blurInput = createElement("input", {
    id: "blur-range",
    type: "range",
    value: `${bgCss.blur}`,
    min: "0.0",
    max: "20.0",
    step: "0.5",
  });
  const blurLabel = createElement("label", {
    htmlFor: "blur-range",
    textContent: "Blur",
  });
  blurContainer.append(blurLabel, blurInput);

  blurInput.addEventListener("input", (e) => {
    bgCss.blur = parseFloat((e.target as HTMLInputElement).value);
    configService.setBgCss(bgCss);
  });

  // 3. Brightness slider
  const brightnessContainer = createElement("div", { className: "container" });
  const brightnessInput = createElement("input", {
    id: "brightness-range",
    type: "range",
    value: `${bgCss.brightness}`,
    min: "0.0",
    max: "1.0",
    step: "0.01",
  });
  const brightnessLabel = createElement("label", {
    htmlFor: "brightness-range",
    textContent: "Brightness",
  });
  brightnessContainer.append(brightnessLabel, brightnessInput);

  brightnessInput.addEventListener("input", (e) => {
    bgCss.brightness = parseFloat((e.target as HTMLInputElement).value);
    configService.setBgCss(bgCss);
  });

  // 4. Scale slider
  const scaleContainer = createElement("div", { className: "container" });
  const scaleInput = createElement("input", {
    id: "scale-range",
    type: "range",
    value: `${bgCss.scale}`,
    min: "1.1",
    max: "5.0",
    step: "0.05",
  });
  const scaleLabel = createElement("label", {
    htmlFor: "scale-range",
    textContent: "Scale",
  });
  scaleContainer.append(scaleLabel, scaleInput);

  scaleInput.addEventListener("input", (e) => {
    bgCss.scale = parseFloat((e.target as HTMLInputElement).value);
    configService.setBgCss(bgCss);
  });

  // Attach mouse-wheel scroll to range sliders
  attachScrollToRange(blurInput);
  attachScrollToRange(brightnessInput);
  attachScrollToRange(scaleInput);

  container.append(imageContainer, blurContainer, brightnessContainer, scaleContainer);
  return container;
}

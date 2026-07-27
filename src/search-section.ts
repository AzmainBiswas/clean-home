import { createDirecturlInput } from "./direct-url";
import {
  getDefaultSearch,
  getSearchEngines,
  type SearchEngines,
} from "./utills/config";
import { createElement } from "./utills/dom";

let searchEngines: SearchEngines = getSearchEngines();

export function createSearchSelection() {
  const form = createElement("form", {
    id: "search-form",
  });
  const select = createElement("select", {
    name: "search-engines",
    id: "search-engine-select",
  });
  const input = createElement("input", {
    id: "search-input",
    name: "search-query",
    placeholder: "Search...",
    type: "text",
    required: true,
  });
  const button = createElement("input", {
    type: "submit",
    value: "Submit",
  });

  createOptions(select);

  form.append(select, input, button);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const selectedObject = select.options[select.selectedIndex];
    const baseUrl = selectedObject.dataset.url;
    const query = input.value.trim();

    if (baseUrl && query) {
      const fullUrl = baseUrl!.replace("%s", encodeURIComponent(query));
      window.location.href = fullUrl;
    }
  });

  document.addEventListener("keydown", (e) => {
    // console.log({
    //   key: e.key,
    //   shift: e.shiftKey,
    //   ctrl: e.ctrlKey,
    //   meta: e.metaKey,
    // });
    if ((e.metaKey || e.ctrlKey) && e.key === "u") {
      e.preventDefault();
      createDirecturlInput();
    } else if ((e.metaKey || e.ctrlKey) && e.key === " ") {
      e.preventDefault();
      input.focus();
    } else if ((e.metaKey || e.ctrlKey) && e.key === "g") {
      e.preventDefault();
      select.value = "google";
      input.focus();
    } else if ((e.metaKey || e.ctrlKey) && e.key === "G") {
      e.preventDefault();
      select.value = "no-ai-google";
      input.focus();
    } else if (e.key === "Escape") {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  });
  return form;
}

export function createOptions(selectElement: HTMLSelectElement) {
  const defaultId = getDefaultSearch();
  const sortedKeys = Object.keys(searchEngines).sort((a, b) => {
    if (a === defaultId) return -1;
    if (b === defaultId) return 1;
    return searchEngines[a].name.localeCompare(searchEngines[b].name);
  });

  selectElement.innerHTML = ``;

  sortedKeys.forEach((key) => {
    const engine = searchEngines[key];
    const option = createElement("option", {
      value: key,
      textContent: engine.name,
      "data-url": engine.url,
    });
    selectElement.appendChild(option);
  });
}

//TODO: indevidual search endine with key map.

// check these for image
// const domain = new URL(selectedUrl).hostname;
// engineIcon.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

// interface Shortcut {
//     ctrl?: boolean;
//     shift?: boolean;
//     key: string;
//     action: () => void;
// }

// // Your "JSON" data (can be moved to a separate file later)
// const keyMaps: Shortcut[] = [
//     { ctrl: true, key: " ", action: () => input.focus() },
//     { ctrl: true, key: "g", action: () => { select.value = "google"; input.focus(); } },
//     { ctrl: true, shift: true, key: "G", action: () => { select.value = "google"; input.focus(); } },
//     { key: "Escape", action: () => (document.activeElement as HTMLElement)?.blur() }
// ];

// document.addEventListener('keydown', (e: KeyboardEvent) => {
//     // Find a shortcut that matches the current key press
//     const match = keyMaps.find(s => {
//         const keyMatch = s.key.toLowerCase() === e.key.toLowerCase();
//         const ctrlMatch = !!s.ctrl === (e.ctrlKey || e.metaKey);
//         const shiftMatch = !!s.shift === e.shiftKey;

//         return keyMatch && ctrlMatch && shiftMatch;
//     });

//     if (match) {
//         e.preventDefault();
//         match.action();
//     }
// });

// [
//   { "ctrl": true, "key": "g", "command": "setGoogle" },
//   { "key": "Escape", "command": "blurAll" }
// ]

// document.addEventListener('keydown', (e: KeyboardEvent) => {
//     // 1. Identify "Typing Elements"
//     const isTyping = document.activeElement instanceof HTMLInputElement ||
//                      document.activeElement instanceof HTMLTextAreaElement ||
//                      (document.activeElement as HTMLElement).isContentEditable;

//     // 2. If the user is typing, ignore single-key shortcuts
//     // But! We usually allow Ctrl/Meta shortcuts to still work while typing
//     const isModifierPressed = e.ctrlKey || e.metaKey || e.altKey;

//     if (isTyping && !isModifierPressed) {
//         return; // Exit early and let the character be typed
//     }

//     // 3. Your shortcut logic follows...
//     if (e.key.toLowerCase() === 'g') {
//         e.preventDefault();
//         select.value = "google";
//         console.log("Switched to Google!");
//     }
// });

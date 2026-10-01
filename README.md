# Clean Home 🌿

A fast, elegant, and distraction-free New Tab dashboard Chrome extension with custom wallpapers, frosted glass blur controls, and multi-engine spotlight search.

---

## Features

- **Spotlight Search**: Multi-engine search with customizable positioning (Top, Middle, Bottom) and toggle visibility.
- **Custom Wallpaper**: Upload your own photo with live blur, brightness, and scale adjustments (persisted in IndexedDB).
- **Synchronized Glassmorphism Blur**: A single slider controls the blur across all UI elements (search bar, settings card, and buttons).
- **Extensible Architecture**: Modular plugin structure making it effortless to add new widgets (Clock, Weather, Bookmarks).

---

## How to Add to Your Browser

Follow these steps to load Clean Home into **Chrome**, **Brave**, **Edge**, or any Chromium browser:

1. **Build the extension**:
   ```bash
   npm install
   npm run build
   ```
2. **Open Extensions in your browser**:
   Navigate to `chrome://extensions/` *(or `brave://extensions/` / `edge://extensions/`)*.
3. **Turn on Developer Mode**:
   Toggle the **Developer mode** switch in the top-right corner to **ON**.
4. **Load the extension**:
   Click **Load unpacked** (top-left) and select the **`dist`** folder inside this repository.
5. **Open a New Tab** (`Ctrl+T` / `Cmd+T`) to start using Clean Home!

---

## Development

- **Run Dev Server**: `npm run dev`
- **Type Check & Build**: `npm run build`
- **Architecture & AI Guidelines**: See [**`AGENTS.md`**](./AGENTS.md) for detailed developer documentation and feature blueprints.

---

## License

MIT

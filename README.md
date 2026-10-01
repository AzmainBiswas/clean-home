# Clean Home 🌿

A fast, elegant, and distraction-free New Tab dashboard Chrome extension with custom wallpapers, quick-access bookmarks, frosted glass blur controls, and multi-engine spotlight search.

---

## Features

- **Quick-Access Bookmarks**: Organize your favorite links in a unified frosted-glass container with customizable columns (2 to 6 columns), automatic favicons, and in-settings management (add, remove, and toggle visibility).
- **Spotlight Search**: Multi-engine search with customizable positioning (Top, Middle, Bottom) and toggle visibility.
- **Custom Wallpaper**: Upload your own photo with live blur, brightness, and scale adjustments (persisted in IndexedDB).
- **Synchronized Glassmorphism Blur**: A single slider controls the blur across all UI elements (search bar, bookmarks container, settings card, and buttons).
- **Extensible Architecture**: Modular plugin structure making it effortless to add new widgets (Clock, Weather, etc.).

---

## How to Add to Your Browser

### Option 1: Quick Install (No Build or Node.js Required)
1. Go to the **[Releases](../../releases)** tab on GitHub and download **`clean-home.zip`** from the latest release.
2. Extract / unzip `clean-home.zip` anywhere on your computer.
3. In Chrome, Brave, or Edge, navigate to `chrome://extensions/`.
4. Turn on the **Developer mode** toggle in the top-right corner.
5. Click **Load unpacked** (top-left) and select the unzipped folder.
6. Open a New Tab (`Ctrl+T` / `Cmd+T`)!

### Option 2: Build from Source
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Build the extension bundle:
   ```bash
   npm run build
   ```
3. In your browser, open `chrome://extensions/` and enable **Developer mode**.
4. Click **Load unpacked** and select the **`dist`** folder inside the project.

---

## Development

- **Run Dev Server**: `npm run dev`
- **Type Check & Build**: `npm run build`
- **Package Release ZIP**: `npm run package` (builds and produces `clean-home.zip`)
- **Architecture & AI Guidelines**: See [**`AGENTS.md`**](./AGENTS.md) for detailed developer documentation, release workflows, and feature blueprints.

---

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/AzmainBiswas"><img src="https://github.com/AzmainBiswas.png?size=100" width="100px;" alt="Azmain Biswas"/><br /><sub><b>Azmain Biswas</b></sub></a><br /><a href="#creator" title="Creator">👑</a> <a href="#design" title="Design">🎨</a> <a href="#maintenance" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://antigravity.google"><img src="https://antigravity.google/favicon.ico" width="100px;" alt="Google Antigravity"/><br /><sub><b>Google Antigravity</b></sub></a><br /><a href="#pair-programming" title="Pair Programming">🤖</a> <a href="#code" title="Code">💻</a> <a href="#doc" title="Documentation">📖</a> <a href="#infra" title="Infrastructure / CI">🚇</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

---

## License

MIT

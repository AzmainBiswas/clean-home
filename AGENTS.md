# Clean Home — AI & Developer Architecture Guide (`AGENTS.md`)

Welcome to the **Clean Home** codebase. This document serves as the authoritative architectural blueprint and operating manual for both AI assistants (such as Google Antigravity) and human software engineers working on this project.

---

## 1. Project Overview & Philosophy

**Clean Home** is a minimalist, elegant, and performance-focused Chrome Extension (Manifest V3) that replaces the browser's default New Tab page (`chrome_url_overrides.newtab`) with a clean dashboard featuring:
- **Custom Wallpaper Management**: Upload, convert to WebP, and store background photos in IndexedDB with real-time blur, brightness, and scale sliders.
- **Spotlight Search Bar**: Multi-engine web search (including AI-free search engines) with configurable positioning (Top, Middle, Bottom), visibility toggle, and keyboard shortcuts.
- **Unified Frosted Glass Blur**: Centralized CSS variable (`--element-blur`) ensuring all floating UI components (search bar, settings card, navigation buttons) share a synchronized, customizable glassmorphism blur.
- **Plugin-Based Feature Architecture**: Extensible widget system where adding new dashboard features (e.g., Clock, Weather, Bookmarks) requires zero modification of existing core files.

---

## 2. How to Load and Install in Your Browser

To run or test this extension in Google Chrome, Brave, Microsoft Edge, or any Chromium-based browser:

### Step 1: Build the Project
Open a terminal in the project directory and build the production bundle:
```bash
npm run build
```
This runs `tsc` for type-checking and `vite build` to generate the compiled static extension files inside the `dist/` folder.

### Step 2: Open Extensions Settings in Chrome
1. In your Chromium browser, navigate to:
   ```text
   chrome://extensions/
   ```
   *(For Brave: `brave://extensions/`, For Edge: `edge://extensions/`)*
2. In the top-right corner of the page, toggle **Developer mode** to **ON**.

### Step 3: Load Unpacked Extension
1. Click the **Load unpacked** button in the top-left toolbar.
2. In the file picker, select the **`dist`** folder inside this project directory (`/path/to/clean-home/dist`).
3. Click **Select Folder** (or **Open**).

### Step 4: Verify
1. Open a new tab in your browser (`Ctrl+T` or `Cmd+T`).
2. You will see the **Clean Home** new tab dashboard!
3. Click the **Settings** button in the bottom-right corner to customize wallpaper, search engine, blur, or bar position.

> [!TIP]
> While developing, run `npm run build` after making code changes, then click the **Reload icon (↻)** on the Clean Home card in `chrome://extensions`.

---

## 3. Tech Stack

- **Language**: TypeScript (`ES2023`, `moduleResolution: "bundler"`, `verbatimModuleSyntax: true`, Strict Mode)
- **Bundler / Dev Server**: Vite 8 with Rollup
- **Platform**: Chrome Extensions Manifest V3 (`public/manifest.json`)
- **Type Definitions**: `@types/chrome`, `vite/client`
- **Storage Technologies**:
  - `chrome.storage.local` (with seamless `localStorage` fallback for dev preview)
  - `IndexedDB` (`BackgroundDB`) for high-resolution wallpaper blobs

---

## 4. Directory Structure

```
clean-home/
├── public/                       # Static public assets
│   ├── favicon.svg               # Extension favicon
│   ├── icons.svg                 # SVG icons
│   └── manifest.json             # Chrome Manifest V3 configuration
├── src/
│   ├── assets/
│   │   └── default-setting.json  # Initial configuration template
│   ├── core/                     # Foundational infrastructure (feature-agnostic)
│   │   ├── config/               # State & configuration management
│   │   │   ├── config.service.ts # In-memory caching, persistence & event dispatch
│   │   │   ├── default-config.ts # Static fallback defaults
│   │   │   └── types.ts          # Core configuration interfaces & types
│   │   ├── events/               # Decoupled communication
│   │   │   └── event-bus.ts      # Type-safe EventBus (Pub/Sub)
│   │   ├── shortcuts/            # Global keyboard handling
│   │   │   └── shortcut-manager.ts # Conflict-safe shortcut registration
│   │   ├── storage/              # Storage abstraction layer
│   │   │   ├── storage.interface.ts # Standard IStorage contract
│   │   │   └── storage.service.ts   # Chrome storage + LocalStorage adapter
│   │   └── types/                # Core extension interfaces
│   │       └── feature.ts        # ExtensionFeature / Widget lifecycle interface
│   ├── features/                 # Self-contained feature modules
│   │   ├── index.ts              # Feature Registry (active extensions list)
│   │   ├── search/               # Search engine switcher & spotlight bar
│   │   │   ├── index.ts          # SearchFeature registration & shortcuts
│   │   │   ├── search.service.ts # Engine queries, URL replacement, routing
│   │   │   ├── search.settings.ts# Settings UI (Engine, Position, Blur, Visibility)
│   │   │   └── search.view.ts    # Dashboard search bar component & positioning
│   │   └── wallpaper/            # Wallpaper management & visual filters
│   │       ├── index.ts          # WallpaperFeature registration
│   │       ├── wallpaper.service.ts  # IndexedDB CRUD & WebP canvas compression
│   │       ├── wallpaper.settings.ts # Settings UI (Upload, Blur, Brightness, Scale)
│   │       └── wallpaper.view.ts     # CSS filter updates & canvas rendering
│   ├── shared/                   # Shared UI primitives and helpers
│   │   └── dom/
│   │       └── dom.ts            # Type-safe createElement & attachScrollToRange
│   ├── main.ts                   # Entry point for the New Tab dashboard
│   ├── settings.ts               # Entry point for the Settings page
│   ├── style.css                 # Global styles & dashboard CSS variables
│   └── settings.css              # Settings page styles & frosted UI components
├── index.html                    # Dashboard HTML host
├── settings.html                 # Settings page HTML host
├── tsconfig.json                 # TypeScript compiler configuration
├── vite.config.ts                # Vite multi-page build configuration
├── package.json                  # Dependencies & build scripts
├── AGENTS.md                     # This AI & Developer architecture guide
└── README.md                     # High-level project summary
```

---

## 5. Architectural Principles & Core Contracts

### 5.1 The `ExtensionFeature` Contract
Every user-facing capability must be implemented as an isolated feature conforming to `ExtensionFeature` in `src/core/types/feature.ts`:

```typescript
export interface ExtensionFeature {
  readonly meta: {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
  };

  /** Asynchronous lifecycle hook for data loading and listeners */
  init(): Promise<void> | void;

  /** Return the widget HTMLElement to mount on the New Tab page (optional) */
  renderWidget?(): HTMLElement | null;

  /** Return the settings section HTMLElement to mount on Settings page (optional) */
  renderSettings?(): HTMLElement | null;

  /** Cleanup event listeners or timers (optional) */
  destroy?(): void;
}
```

### 5.2 Decoupled Event-Driven Communication (`EventBus`)
**Never directly import one feature module into another.** Cross-feature communication happens strictly via the type-safe `EventBus` (`src/core/events/event-bus.ts`):
```typescript
// Subscribe:
EventBus.on("wallpaper:filters-changed", (css) => { ... });

// Publish:
EventBus.emit("wallpaper:filters-changed", newCss);
```

### 5.3 Unified Storage Strategy (`StorageService`)
Do not call `localStorage` directly in feature files. Always use `configService` or `storage` from `src/core/storage/storage.service.ts`:
- Seamlessly uses `chrome.storage.local` inside extension environments.
- Gracefully falls back to `localStorage` during local Vite browser preview.

### 5.4 Declarative Styling with CSS Variables
Do not mutate element inline styles (`el.style.filter = ...`). Instead, set CSS custom properties on `:root` or the target container:
- `--bg-blur`: Wallpaper blur radius (px).
- `--bg-brightness`: Wallpaper brightness multiplier (0.0 to 1.0).
- `--bg-scale`: Wallpaper zoom scale (1.1 to 5.0).
- `--element-blur`: Synchronized backdrop blur for all UI components.

---

## 6. How to Add a New Feature in 5 Minutes

To add a new feature (e.g., a **Digital Clock** or **Weather Widget**):

### 1. Create Feature Folder `src/features/clock/`
Create `src/features/clock/index.ts`:
```typescript
import type { ExtensionFeature } from "../../core/types/feature";
import { createElement } from "../../shared/dom/dom";

export const ClockFeature: ExtensionFeature = {
  meta: {
    id: "clock",
    name: "Digital Clock",
    description: "Displays current time in clean typography",
  },

  init(): void {
    // Start timers or load clock preferences
  },

  renderWidget(): HTMLElement {
    const clockDiv = createElement("div", { className: "clock-widget" });
    const updateTime = () => {
      clockDiv.textContent = new Date().toLocaleTimeString();
    };
    updateTime();
    setInterval(updateTime, 1000);
    return clockDiv;
  },

  renderSettings(): HTMLElement {
    // Optional settings controls (e.g. 12h vs 24h toggle)
    return createElement("div", { className: "container", textContent: "Clock Settings" });
  },
};
```

### 2. Register in Feature Registry (`src/features/index.ts`)
```typescript
import { WallpaperFeature } from "./wallpaper";
import { SearchFeature } from "./search";
import { ClockFeature } from "./clock";

export const features: ExtensionFeature[] = [
  WallpaperFeature,
  SearchFeature,
  ClockFeature, // <-- Added here
];
```

### 3. Build & Done!
Run `npm run build`. Both `main.ts` and `settings.ts` automatically detect, initialize, and mount the clock widget and its settings panel without altering any core files.

---

## 7. Guidelines for AI Coding Agents

When proposing or executing changes in this repository:
1. **Preserve Modularity**: Keep code within the appropriate layer (`core/`, `features/`, `shared/`).
2. **Never Add Side Effects to Module Roots**: Do not trigger DOM mutations, database queries, or network requests at the top level of any file. Always place them inside `init()` or explicit functions.
3. **Keep Typing Strict**: Avoid `any`. All event payloads, configs, and DOM helpers must remain type-safe.
4. **Synchronize Blur Tokens**: All new glassmorphism elements must use `backdrop-filter: blur(var(--element-blur))`.
5. **Always Verify**: Run `npm run build` (`tsc && vite build`) to guarantee zero compilation or lint errors.

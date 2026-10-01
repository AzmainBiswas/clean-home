# Clean Home Extension: Code Audit & Modular Architecture Plan

## 1. Executive Summary

This document provides a comprehensive code quality assessment of the **Clean Home** Chrome extension and outlines a phased, production-grade refactoring plan to transform it into a **modular, plugin-based architecture**.

Currently, the extension functions as a custom "New Tab" page replacing Chrome's default dashboard with wallpaper management, multi-engine search, and a direct URL launcher. While the core functionality works, the codebase suffers from **tight coupling**, **side-effects on module import**, **naming confusion with Chrome MV3 standards**, **inconsistent storage strategies**, and **unstructured DOM generation**.

Adopting this modular plan will allow developers to plug in new dashboard widgets (e.g., Weather, Clock/Date, Bookmarks, Quick Links, Todo/Notes, System Stats) in minutes without modifying core files.

---

## 2. Codebase Audit: Standards & Modularity Review

### 2.1 Standard & Best Practice Violations

| Issue | Location | Impact | Severity |
| :--- | :--- | :--- | :--- |
| **Misleading Module Name** | `src/background.ts` | In Chrome Extension Manifest V3, `background` denotes the background service worker (`service_worker`). Here it represents the wallpaper/background image UI module. | **High** |
| **Top-Level Side Effects on Import** | `src/background.ts` | Opening IndexedDB and mutating DOM (`applyBackground()`) executes immediately when the file is imported, making testing, bundling, and SSR/isolation impossible. | **High** |
| **Redundant Imports** | `src/main.ts` | `import "./search-section.ts";` is imported twice (once as named import and once as side-effect). | **Low** |
| **Directory & Symbol Typos** | Multiple files | `src/utills/` (should be `utils`), `reslove` (should be `resolve`), `brighContainer` (`brightness`), `createSearchSelection` (should be `createSearchSection`), `Cleane Home` in `manifest.json`. | **Medium** |
| **Invalid CSS Syntax** | `style.css` (line 160), `settings.css` (line 160) | `border: 1px solid rgbargba(21, 21, 21, 0.056);` is invalid CSS syntax and silently ignored by browsers. | **Low** |
| **Hardcoded Inline Style Mutation** | `src/background.ts` (`applyBGCss`) | Overwrites `.style` properties (`filter`, `transform`, `position`, `width`, `height`, `zIndex`) directly with JS strings rather than using CSS classes or CSS Custom Properties (variables). | **Medium** |
| **Storage Fragmentation** | `config.ts` vs `background.ts` | Uses `localStorage` (synchronous, origin-bound) for config and `IndexedDB` for images. Neither uses Chrome's standard `chrome.storage.local`, which handles extension lifecycle and sync. | **Medium** |
| **Dead / Commented-Out Code** | `src/search-section.ts` | Over 60 lines of commented-out keyboard shortcut experiments and icon logic clutter the file. | **Low** |
| **Fragile Shortcut Management** | `src/search-section.ts` | Shortcuts like `Ctrl+u`, `Ctrl+g` are hardcoded in an `if-else` chain, conflicting with native browser shortcuts (`Ctrl+u` = View Source) with no way to customize. | **Medium** |

---

### 2.2 Modularity Assessment

| Evaluation Area | Current Status | Target Architecture |
| :--- | :--- | :--- |
| **Component Model** | Imperative DOM construction mixed directly with business logic in single files. | Modular `Feature` / `Widget` interface with clear `init()`, `render()`, and `destroy()` lifecycles. |
| **State & Config Management** | `getConfig()` re-reads and parses `localStorage` on every single getter call. | Reactive Store / Config Service with caching and subscription (`onChanged`). |
| **Cross-Feature Communication** | Tight coupling; files import each other directly (e.g. `search-section.ts` imports `direct-url.ts`). | Central lightweight Event Bus (pub/sub). |
| **Extensibility (Adding Features)** | High friction. Adding a new widget requires editing `index.html`, `main.ts`, `settings.html`, `settings.ts`, and adding CSS manually. | Low friction. Adding a feature only requires adding a folder in `src/features/` and registering it in a feature registry. |

---

## 3. Target Architecture & Design Principles

```
src/
├── core/                         # Core infrastructure (independent of specific features)
│   ├── config/                   # Central typed configuration & defaults
│   │   ├── config.service.ts
│   │   ├── default-config.ts
│   │   └── types.ts
│   ├── events/                   # Central Event Bus (Pub/Sub)
│   │   ├── event-bus.ts
│   │   └── events.ts
│   ├── storage/                  # Storage abstractions (chrome.storage, IDB, Fallbacks)
│   │   ├── storage.interface.ts
│   │   ├── chrome-storage.ts
│   │   └── idb-storage.ts
│   ├── shortcuts/                # Central Keyboard Shortcut Manager
│   │   ├── shortcut-manager.ts
│   │   └── types.ts
│   └── types/                    # Core extension interfaces & contracts
│       ├── feature.ts            # ExtensionFeature / Widget interface
│       └── dom.ts
│
├── features/                     # Self-contained feature modules
│   ├── wallpaper/                # Wallpaper & Background Effects
│   │   ├── wallpaper.service.ts  # IDB storage, image compression
│   │   ├── wallpaper.view.ts     # Visual wallpaper renderer (CSS variables)
│   │   ├── wallpaper.settings.ts # Settings controls (blur, brightness, scale sliders)
│   │   └── index.ts              # Feature export
│   │
│   ├── search/                   # Search Bar & Engine Switcher
│   │   ├── search.service.ts     # Engine registry, query formulation
│   │   ├── search.view.ts        # Search bar DOM component
│   │   ├── search.settings.ts    # Search engine selection settings
│   │   └── index.ts
│   │
│   ├── direct-url/               # Quick URL Launcher Overlay
│   │   ├── direct-url.service.ts # URL normalization & history
│   │   ├── direct-url.view.ts    # Modal dialog component
│   │   └── index.ts
│   │
│   └── (Future Features)         # Easily drop in: clock, weather, bookmarks, notes
│       ├── clock/
│       ├── weather/
│       └── bookmarks/
│
├── shared/                       # Reusable UI helpers and design tokens
│   ├── dom/                      # Type-safe createElement, event helpers
│   │   └── dom.ts
│   ├── components/               # Common UI widgets (SliderControl, Dropdown, Modal)
│   │   ├── slider.ts
│   │   └── select.ts
│   └── styles/                   # Design tokens & baseline styles
│       ├── tokens.css            # CSS variables for blur, theme, spacing
│       ├── glass.css             # Glassmorphism utilities
│       └── base.css              # Reset & typography
│
└── pages/                        # Extension page entrypoints
    ├── newtab/                   # New Tab Dashboard Page
    │   ├── newtab.html
    │   ├── newtab.ts
    │   └── newtab.css
    └── settings/                 # Settings / Options Page
        ├── settings.html
        ├── settings.ts
        └── settings.css
```

---

## 4. Core Abstraction Designs

### 4.1 Feature / Widget Contract (`src/core/types/feature.ts`)

Every feature implements a uniform interface:

```typescript
export interface FeatureMetadata {
  id: string;
  name: string;
  description?: string;
  enabled?: boolean;
}

export interface ExtensionFeature {
  readonly meta: FeatureMetadata;

  /** Initialize services, register listeners, load initial data */
  init(): Promise<void> | void;

  /** Render the primary UI widget on the New Tab page (if applicable) */
  renderWidget?(): HTMLElement | null;

  /** Render the configuration UI on the Settings page (if applicable) */
  renderSettings?(): HTMLElement | null;

  /** Teardown listeners / memory cleanup */
  destroy?(): void;
}
```

### 4.2 Central Event Bus (`src/core/events/event-bus.ts`)

Decouples features so they don't directly reference each other:

```typescript
export type EventPayloads = {
  "config:changed": { key: string; value: unknown };
  "wallpaper:updated": { blobUrl: string };
  "wallpaper:filters-changed": { blur: number; brightness: number; scale: number };
  "search:submitted": { query: string; engineId: string };
  "direct-url:open": void;
};

export class EventBus {
  private static listeners = new Map<string, Set<(payload: any) => void>>();

  static on<K extends keyof EventPayloads>(event: K, handler: (payload: EventPayloads[K]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  static off<K extends keyof EventPayloads>(event: K, handler: (payload: EventPayloads[K]) => void): void {
    this.listeners.get(event)?.delete(handler);
  }

  static emit<K extends keyof EventPayloads>(event: K, payload: EventPayloads[K]): void {
    this.listeners.get(event)?.forEach(handler => handler(payload));
  }
}
```

### 4.3 Unified Storage Service (`src/core/storage/`)

Wraps `chrome.storage.local` with automatic fallback to `localStorage` (ensuring developer experience in standard Vite preview/dev browser):

```typescript
export interface IStorage {
  get<T>(key: string, defaultValue: T): Promise<T>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}
```

### 4.4 Central Keyboard Shortcut Manager (`src/core/shortcuts/`)

A centralized listener that avoids scattershot `keydown` handlers:

```typescript
export interface Shortcut {
  id: string;
  description: string;
  combo: {
    key: string;
    ctrlOrMeta?: boolean;
    shift?: boolean;
    alt?: boolean;
  };
  handler: (e: KeyboardEvent) => void;
  allowInInputs?: boolean;
}
```

---

## 5. Phased Implementation Roadmap

### Phase 1: Cleanups & Immediate Fixes
- [ ] Rename `src/utills/` to `src/utils/`.
- [ ] Fix syntax errors: `rgbargba(...)` -> `rgba(...)` in CSS files.
- [ ] Fix typos in function names (`reslove` -> `resolve`, `brighContainer` -> `brightnessContainer`).
- [ ] Correct `"Cleane Home"` to `"Clean Home"` in `public/manifest.json`.
- [ ] Add `storage` permission in `manifest.json`.
- [ ] Clean up dead commented-out code in `search-section.ts`.

### Phase 2: Core Architecture Setup
- [ ] Set up `src/core/types/` (Feature, Config, Shortcut definitions).
- [ ] Implement `EventBus` in `src/core/events/`.
- [ ] Create `StorageService` in `src/core/storage/` with fallback support.
- [ ] Build `ConfigService` with in-memory caching and change events.
- [ ] Implement `ShortcutManager` in `src/core/shortcuts/`.

### Phase 3: Feature Decoupling
- [ ] **Wallpaper Feature (`src/features/wallpaper/`)**:
  - Rename misleading `background.ts` into a clean feature module.
  - Move IndexedDB operations into `wallpaper.service.ts`.
  - Use CSS custom properties (`--bg-blur`, `--bg-brightness`, `--bg-scale`) on `:root` instead of hardcoded inline styles.
  - Separate settings controls into `wallpaper.settings.ts`.
- [ ] **Search Feature (`src/features/search/`)**:
  - Separate search logic, dropdown generation, and settings configuration.
  - Register `Ctrl+Space`, `Ctrl+g`, `Ctrl+G` through `ShortcutManager`.
- [ ] **Direct URL Feature (`src/features/direct-url/`)**:
  - Move modal UI into `direct-url.view.ts`.
  - Register shortcut `Ctrl+u` via `ShortcutManager`.

### Phase 4: Dynamic Feature Registry & Pages
- [ ] Create `FeatureRegistry` that loads all enabled features.
- [ ] Update `newtab.ts` (`main.ts`):
  ```typescript
  const features: ExtensionFeature[] = [WallpaperFeature, SearchFeature, DirectUrlFeature];
  await Promise.all(features.map(f => f.init()));
  features.forEach(f => {
    const el = f.renderWidget?.();
    if (el) dashboardContainer.appendChild(el);
  });
  ```
- [ ] Update `settings.ts` to automatically render each registered feature's `renderSettings()` section.

### Phase 5: Verification & DX
- [ ] Update `vite.config.ts` input points and path aliases (`@core`, `@features`, `@shared`).
- [ ] Verify `npm run build` and `tsc` pass with zero type errors.
- [ ] Test extension in Chrome (`chrome://extensions` unpacked).

---

## 6. How to Add a New Feature (Developer Workflow)

Once this architecture is in place, adding a new feature (e.g. **Digital Clock**) takes only 3 simple steps:

1. **Create Feature Directory** `src/features/clock/`:
   - `clock.view.ts`: Creates a `<div>` displaying current time formatted with CSS.
   - `clock.settings.ts`: Checkbox for 12h/24h format and show/hide seconds.
   - `index.ts`:
     ```typescript
     export const ClockFeature: ExtensionFeature = {
       meta: { id: "clock", name: "Digital Clock" },
       init() { /* start interval timer */ },
       renderWidget() { return createClockElement(); },
       renderSettings() { return createClockSettings(); },
     };
     ```
2. **Register in Registry**:
   Add `ClockFeature` to the feature list in `src/features/index.ts`.
3. **Done!** The New Tab page displays the clock, and the Settings page automatically gets the clock options panel without editing any HTML or core files.

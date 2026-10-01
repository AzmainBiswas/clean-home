export interface ShortcutCombo {
  key: string;
  ctrlOrMeta?: boolean;
  shift?: boolean;
  alt?: boolean;
}

export interface ShortcutRegistration {
  id: string;
  description: string;
  combo: ShortcutCombo;
  allowInInputs?: boolean;
  action: (e: KeyboardEvent) => void;
}

export class ShortcutManager {
  private shortcuts: ShortcutRegistration[] = [];
  private listenerAttached = false;

  register(shortcut: ShortcutRegistration): () => void {
    this.shortcuts.push(shortcut);
    this.ensureListener();
    return () => this.unregister(shortcut.id);
  }

  unregister(id: string): void {
    this.shortcuts = this.shortcuts.filter((s) => s.id !== id);
  }

  private ensureListener(): void {
    if (this.listenerAttached) return;

    document.addEventListener("keydown", (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTyping =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        (activeEl instanceof HTMLElement && activeEl.isContentEditable);

      for (const s of this.shortcuts) {
        const combo = s.combo;
        const matchesKey = e.key.toLowerCase() === combo.key.toLowerCase();
        const matchesCtrlOrMeta = combo.ctrlOrMeta
          ? e.ctrlKey || e.metaKey
          : !(e.ctrlKey || e.metaKey);
        const matchesShift = combo.shift ? e.shiftKey : !e.shiftKey;
        const matchesAlt = combo.alt ? e.altKey : !e.altKey;

        if (matchesKey && matchesCtrlOrMeta && matchesShift && matchesAlt) {
          if (isTyping && !s.allowInInputs) {
            // If typing in input, only fire if ctrl/meta/escape
            if (e.key !== "Escape" && !(e.ctrlKey || e.metaKey)) {
              continue;
            }
          }

          e.preventDefault();
          s.action(e);
          return;
        }
      }
    });

    this.listenerAttached = true;
  }
}

export const shortcutManager = new ShortcutManager();

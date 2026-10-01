/**
 * Unified metadata and interface for clean-home features/widgets.
 */
export interface FeatureMetadata {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
}

export interface ExtensionFeature {
  readonly meta: FeatureMetadata;

  /**
   * Asynchronous lifecycle initialization.
   * Load stored data, attach event listeners, prepare state.
   */
  init(): Promise<void> | void;

  /**
   * Render primary UI widget for the dashboard (if this feature has a newtab widget).
   */
  renderWidget?(): HTMLElement | null;

  /**
   * Render settings section on the settings/options page (if this feature has configurable options).
   */
  renderSettings?(): HTMLElement | null;

  /**
   * Cleanup resources, intervals, or event listeners if unmounted.
   */
  destroy?(): void;
}

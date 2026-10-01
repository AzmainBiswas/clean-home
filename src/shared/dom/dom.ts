/**
 * Helper to create DOM elements with typed attributes and children.
 */
export function createElement<T extends keyof HTMLElementTagNameMap>(
  tag: T,
  options: Partial<HTMLElementTagNameMap[T]> & Record<string, any> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[T] {
  const el = document.createElement(tag);

  Object.entries(options).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "className") {
      el.className = String(value);
    } else if (key === "textContent") {
      el.textContent = String(value);
    } else if (key === "innerHTML") {
      el.innerHTML = String(value);
    } else if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, value);
    } else if (key in el) {
      try {
        (el as any)[key] = value;
      } catch {
        el.setAttribute(key, String(value));
      }
    } else {
      el.setAttribute(key, String(value));
    }
  });

  for (const child of children) {
    if (typeof child === "string") {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  }

  return el;
}

/**
 * Attaches a mouse-wheel event listener to an input[type=range]
 * to adjust values via scroll.
 */
export function attachScrollToRange(
  input: HTMLInputElement,
  stepMultiplier: number = 1,
): () => void {
  const handler = (event: WheelEvent) => {
    event.preventDefault();

    const direction = event.deltaY < 0 ? 1 : -1;
    const currentVal = parseFloat(input.value) || 0;
    const step = parseFloat(input.step) || 1;
    const min = input.min !== "" ? parseFloat(input.min) : -Infinity;
    const max = input.max !== "" ? parseFloat(input.max) : Infinity;

    let newValue = currentVal + direction * step * stepMultiplier;
    newValue = Math.max(min, Math.min(max, newValue));

    // Handle decimal precision
    const precision = (input.step.split(".")[1] || "").length;
    input.value = newValue.toFixed(precision);
    input.dispatchEvent(new Event("change"));
  };

  input.addEventListener("wheel", handler, { passive: false });
  return () => input.removeEventListener("wheel", handler);
}

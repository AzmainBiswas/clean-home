export function createElement<T extends keyof HTMLElementTagNameMap>(
  tag: T,
  options: Partial<HTMLElementTagNameMap[T]> & { [key: string]: any } = {},
): HTMLElementTagNameMap[T] {
  const el = document.createElement(tag);

  Object.entries(options).forEach(([key, value]) => {
    if (key in el) {
      (el as any)[key] = value;
    } else {
      el.setAttribute(key, value as string);
    }
  });

  return el;
}

export function attachScrollToRange(input: HTMLInputElement, stepMultiplier: number = 1) {
  input.addEventListener("wheel", (event: WheelEvent) => {
    event.preventDefault();

    const direction = event.deltaY < 0 ? 1 : -1;
    const currentVal = parseFloat(input.value);
    const step = parseFloat(input.step) || 1;
    const newValue = currentVal + (direction * step * stepMultiplier);
    input.value = newValue.toString();
    input.dispatchEvent(new Event("change"));
  }, { passive: false }); // 'passive: false' is required to use preventDefault()
}

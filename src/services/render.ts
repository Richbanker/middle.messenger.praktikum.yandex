import Block from "./Block";

export function render(query: string, block: Block): HTMLElement {
  const root = document.querySelector(query);
  if (!root) throw new Error(`Root not found: ${query}`);

  block.dispatchComponentDidMount();

  setTimeout(() => {
    const content = block.getContent();
    if (!content) {
      throw new Error("Render failed: content is empty");
    }

    root.innerHTML = '';
    root.appendChild(content);
  }, 0);

  return root as HTMLElement;
}

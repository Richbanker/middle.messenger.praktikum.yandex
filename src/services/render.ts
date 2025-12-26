import Block from "./Block";

export function render(query: string, block: Block): HTMLElement {
  const root = document.querySelector(query);
  if (!root) throw new Error(`Root not found: ${query}`);

  block.dispatchComponentDidMount();

  const tryRender = () => {
    const content = block.getContent();
    if (content && content.innerHTML !== '') {
      root.innerHTML = '';
      root.appendChild(content);
    } else {
      setTimeout(tryRender, 10);
    }
  };

  setTimeout(tryRender, 0);

  return root as HTMLElement;
}

export function nanoid(size = 21): string {
  const alphabet = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLFGQZbfghjklqvwyzrict';
  let id = '';
  let i = size;
  while (i--) {
    id += alphabet[(Math.random() * 64) | 0];
  }
  return id;
}


export function template(str: string, data: Record<string, unknown>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match;
  });
}


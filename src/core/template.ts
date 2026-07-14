
export function template(template: string, values: Record<string, any> = {}): string {
  return template.replace(/{(.*?)}/g, (_, expression) => {
    const fallbackIndex = expression.indexOf(":");
    const key = fallbackIndex === -1 ? expression : expression.slice(0, fallbackIndex);
    const fallback = fallbackIndex === -1 ? "" : expression.slice(fallbackIndex + 1);
    const value = key ? values[key] : undefined;

    return value === undefined || value === null ? fallback : String(value);
  });
}

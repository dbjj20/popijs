
export function template(template: string, values?: Record<string, any>): string {
  if (!values) return template;

  let replaced = false;

  const result = template.replace(/{(.*?)}/g, (_, key) => {
    const value = key ? values[key] : undefined;

    if (value === undefined || value === null) {
      return `{${key}}`;
    }

    replaced = true;
    return String(value);
  });

  return replaced ? result : template;
}

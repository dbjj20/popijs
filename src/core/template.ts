
export function template(template: string, values?: Record<string, any>): string {
  let count = 0;
  let counterRes = false;

  if (!values) return template;

  const result = template.replace(/{(.*?)}/g, (_, key) => {
    const res = String(key ? values[key] : "");
    if (res) {
      count += 1;
      counterRes = true;
      return res;
    }
    return template;
  });

  return (count >= 1 && counterRes) ? result : template;
}

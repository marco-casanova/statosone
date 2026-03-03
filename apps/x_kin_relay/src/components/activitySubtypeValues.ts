export function getActivitySubtypeValues(activity: Record<string, unknown>) {
  const seen = new Set<string>();
  const values: string[] = [];

  Object.keys(activity)
    .filter((key) => key.startsWith("subtype_") && activity[key])
    .forEach((key) => {
      const value = activity[key];
      if (typeof value !== "string" || seen.has(value)) {
        return;
      }
      seen.add(value);
      values.push(value);
    });

  return values;
}

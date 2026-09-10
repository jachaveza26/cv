// Minimal JSON Schema subset validator. No dependencies on purpose:
// the build must run with nothing but Node.
export function validate(value, schema, path = "$") {
  const errors = [];
  const types = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : [];
  const actual = value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
  if (types.length && !types.includes(actual)) {
    errors.push(`${path}: expected ${types.join("|")}, got ${actual}`);
    return errors;
  }
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${path}: not one of ${schema.enum.join(", ")}`);
  if (typeof value === "string") {
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${path}: does not match ${schema.pattern}`);
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(`${path}: shorter than ${schema.minLength}`);
  }
  if (actual === "object") {
    for (const key of schema.required ?? []) if (!(key in value)) errors.push(`${path}.${key}: required`);
    const props = schema.properties ?? {};
    for (const [key, sub] of Object.entries(props)) if (key in value) errors.push(...validate(value[key], sub, `${path}.${key}`));
    if (schema.additionalProperties === false) for (const key of Object.keys(value)) if (!(key in props)) errors.push(`${path}.${key}: unexpected property`);
  }
  if (actual === "array") {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${path}: fewer than ${schema.minItems} items`);
    if (schema.items) value.forEach((item, i) => errors.push(...validate(item, schema.items, `${path}[${i}]`)));
  }
  return errors;
}

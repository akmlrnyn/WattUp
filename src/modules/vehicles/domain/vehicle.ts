export class VehicleValidationError extends Error {}

export function validateVehicle(brand: unknown, model: unknown) {
  const normalize = (value: unknown) => typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  const result = { brand: normalize(brand), model: normalize(model) };
  if (!result.brand || !result.model || result.brand.length > 60 || result.model.length > 60) {
    throw new VehicleValidationError("Merek dan tipe / model wajib diisi, maksimal 60 karakter masing-masing.");
  }
  return result;
}

export function generateVehicleLabel(brand: string, model: string, existingNames: string[]) {
  const base = `${brand} ${model}`;
  const used = new Set(existingNames.map(name => name.toLocaleLowerCase("id")));
  let label = base;
  let suffix = 2;
  while (used.has(label.toLocaleLowerCase("id"))) label = `${base} ${suffix++}`;
  return label;
}

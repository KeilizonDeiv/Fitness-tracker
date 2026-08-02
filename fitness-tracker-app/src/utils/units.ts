export type UnitSystem = 'metric' | 'imperial';

const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;

export const kgToLb = (kg: number) => kg / KG_PER_LB;
export const lbToKg = (lb: number) => lb * KG_PER_LB;
export const cmToIn = (cm: number) => cm / CM_PER_IN;
export const inToCm = (inches: number) => inches * CM_PER_IN;

export const weightUnitLabel = (units: UnitSystem) => (units === 'metric' ? 'kg' : 'lb');
export const heightUnitLabel = (units: UnitSystem) => (units === 'metric' ? 'cm' : 'in');

/** Convert a canonical kg value to the display unit, rounded for UI. */
export function displayWeight(weightKg: number, units: UnitSystem): number {
  const value = units === 'metric' ? weightKg : kgToLb(weightKg);
  return Math.round(value * 10) / 10;
}

/** Convert a canonical cm value to the display unit, rounded for UI. */
export function displayHeight(heightCm: number, units: UnitSystem): number {
  const value = units === 'metric' ? heightCm : cmToIn(heightCm);
  return Math.round(value * 10) / 10;
}

/** Parse a user-typed weight in the display unit back to canonical kg. */
export function parseWeightToKg(input: string, units: UnitSystem): number {
  const value = Number(input) || 0;
  return units === 'metric' ? value : lbToKg(value);
}

/** Parse a user-typed height in the display unit back to canonical cm. */
export function parseHeightToCm(input: string, units: UnitSystem): number {
  const value = Number(input) || 0;
  return units === 'metric' ? value : inToCm(value);
}

export function formatWeight(weightKg: number, units: UnitSystem): string {
  return `${displayWeight(weightKg, units)} ${weightUnitLabel(units)}`;
}

export function formatHeight(heightCm: number, units: UnitSystem): string {
  return `${displayHeight(heightCm, units)} ${heightUnitLabel(units)}`;
}

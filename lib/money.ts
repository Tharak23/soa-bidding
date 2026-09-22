/**
 * Currency and subunit formatting utilities.
 * All monetary amounts in BidVelocity are stored as integer subunits (1 INR = 100 Paise).
 */

export function formatInr(subunits: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(subunits / 100);
}

// Backward-compatible alias for formatInr (defaulting to INR)
export function centsToDisplay(subunits: number, currency = "INR") {
  return formatInr(subunits, currency);
}

export function rupeesToSubunits(value: string) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return Math.round(parsed * 100);
}

// Backward-compatible alias for rupeesToSubunits
export function dollarsToCents(value: string) {
  return rupeesToSubunits(value);
}

export function subunitsToRupeesInput(subunits: number) {
  return (subunits / 100).toFixed(2);
}

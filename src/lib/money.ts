/**
 * Every amount in this codebase is an integer number of paise.
 * Razorpay also speaks paise, so nothing is ever rounded in transit.
 */

export function formatINR(paise: number, opts: { decimals?: boolean } = {}): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: opts.decimals ? 2 : 0,
    maximumFractionDigits: opts.decimals ? 2 : 0,
  }).format(rupees);
}

export function rupeesToPaise(rupees: number | string): number {
  const n = typeof rupees === "string" ? Number(rupees) : rupees;
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/** Free shipping above this order value; a flat fee below it. */
export const FREE_SHIPPING_THRESHOLD = 2_500_00; // Rs 2,500
export const FLAT_SHIPPING = 250_00; // Rs 250

export function shippingFor(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
}

export function discountPercent(price: number, compareAt?: number | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

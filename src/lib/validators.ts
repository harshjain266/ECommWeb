import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Please enter your name").max(80),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  password: z.string().min(8, "Use at least 8 characters").max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export const addToCartSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1).nullish(),
  quantity: z.coerce.number().int().min(1).max(10).default(1),
});

export const updateCartSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.coerce.number().int().min(0).max(10),
});

export const addressSchema = z.object({
  fullName: z.string().min(2, "Enter the recipient's name").max(80),
  phone: z.string().regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number"),
  line1: z.string().min(4, "Enter the street address").max(160),
  line2: z.string().max(160).optional().or(z.literal("")),
  city: z.string().min(2, "Enter the city").max(80),
  state: z.string().min(2, "Enter the state").max(80),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit PIN code"),
  country: z.string().default("India"),
});

export const checkoutSchema = addressSchema.extend({
  email: z.string().email("Enter a valid email"),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

const mediaInput = z.object({
  publicId: z.string().min(1),
  kind: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  alt: z.string().max(200).optional().or(z.literal("")),
  position: z.coerce.number().int().min(0).default(0),
});

const variantInput = z.object({
  size: z.string().min(1).max(40),
  stock: z.coerce.number().int().min(0).default(0),
  priceDelta: z.coerce.number().int().default(0),
  position: z.coerce.number().int().min(0).default(0),
});

export const productSchema = z.object({
  name: z.string().min(2, "Enter a product name").max(140),
  slug: z.string().min(2).max(140).optional(),
  tagline: z.string().max(160).optional().or(z.literal("")),
  description: z.string().min(10, "Write at least a short description"),
  /** Rupees in the form; converted to paise before persisting. */
  price: z.coerce.number().min(1, "Price must be greater than zero"),
  compareAtPrice: z.coerce.number().min(0).optional().nullable(),
  sku: z.string().min(2).max(60),
  categoryId: z.string().optional().nullable(),
  fabric: z.string().max(120).optional().or(z.literal("")),
  color: z.string().max(80).optional().or(z.literal("")),
  craft: z.string().max(160).optional().or(z.literal("")),
  careNotes: z.string().max(500).optional().or(z.literal("")),
  isActive: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
  isNewArrival: z.coerce.boolean().default(false),
  position: z.coerce.number().int().min(0).default(0),
  media: z.array(mediaInput).default([]),
  variants: z.array(variantInput).default([]),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(80).optional(),
  description: z.string().max(400).optional().or(z.literal("")),
  parentId: z.string().optional().nullable(),
  imageId: z.string().optional().or(z.literal("")),
  /** Whether `imageId` is a still or a clip. Shelves accept both. */
  imageKind: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  position: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
  featured: z.coerce.boolean().default(false),
});

export const bannerSchema = z.object({
  title: z.string().min(1).max(140),
  subtitle: z.string().max(300).optional().or(z.literal("")),
  eyebrow: z.string().max(80).optional().or(z.literal("")),
  ctaLabel: z.string().max(40).optional().or(z.literal("")),
  ctaHref: z.string().max(200).optional().or(z.literal("")),
  publicId: z.string().min(1, "Choose or upload an asset"),
  kind: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  slot: z.enum(["HERO", "MARQUEE", "EDITORIAL"]).default("HERO"),
  position: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
});

export const orderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "PAID",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
});

export const userRoleSchema = z.object({
  role: z.enum(["CUSTOMER", "ADMIN"]),
});

/** Flatten a ZodError into `{ field: message }` for form rendering. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

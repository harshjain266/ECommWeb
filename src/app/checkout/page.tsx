import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { SiteChrome } from "@/components/site/SiteChrome";
import { CheckoutForm } from "@/components/site/CheckoutForm";
import { getCartView } from "@/lib/cart";
import { getSession } from "@/lib/session";
import { razorpayConfigured } from "@/lib/razorpay";

export const metadata: Metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const cart = await getCartView();
  // Nothing to pay for -- send them back rather than showing an empty form.
  if (cart.lines.length === 0) redirect("/cart");

  const session = await getSession();

  // Pre-fill from the buyer's default address when we already have one.
  const address = session
    ? await prisma.address.findFirst({
        where: { userId: session.userId },
        orderBy: [{ isDefault: "desc" }, { id: "desc" }],
      })
    : null;

  return (
    <SiteChrome>
      <CheckoutForm
        cart={cart}
        paymentsReady={razorpayConfigured()}
        prefill={{
          email: session?.email ?? "",
          fullName: address?.fullName ?? session?.name ?? "",
          phone: address?.phone ?? "",
          line1: address?.line1 ?? "",
          line2: address?.line2 ?? "",
          city: address?.city ?? "",
          state: address?.state ?? "",
          pincode: address?.pincode ?? "",
        }}
      />
    </SiteChrome>
  );
}

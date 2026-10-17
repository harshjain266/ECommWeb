import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { prisma } from "@/lib/db";
import { SiteChrome } from "@/components/site/SiteChrome";
import { CldImage } from "@/components/ui/CldImage";
import { Reveal } from "@/components/ui/Reveal";
import { getSession } from "@/lib/session";
import { formatINR } from "@/lib/money";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Order confirmed" };
export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, payment: true },
  });
  if (!order) notFound();

  // A guest order is reachable by its (unguessable) id; a customer's own order
  // is also reachable. Anything else is somebody else's order.
  const session = await getSession();
  const mine = order.userId === null || order.userId === session?.userId;
  const isAdmin = session?.role === "ADMIN";
  if (!mine && !isAdmin) notFound();

  const ship = order.shipAddress as Record<string, string> | null;
  const paid = order.status !== "PENDING" && order.status !== "CANCELLED";

  return (
    <SiteChrome>
      <div className="shell py-16 lg:py-24">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            {paid ? (
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink">
                <Check className="h-6 w-6 text-gold-light" strokeWidth={1.5} />
              </span>
            ) : (
              <p className="label text-oxblood">Awaiting payment</p>
            )}

            <h1 className="display mt-6 text-[clamp(2.2rem,6vw,3.6rem)] text-ink">
              {paid ? "Thank you" : "Your order is reserved"}
            </h1>
            <p className="mt-4 text-pretty font-sans text-[15px] leading-relaxed text-ink-mute">
              {paid
                ? "We have your order. The atelier will be in touch within two working days to arrange measurements."
                : "This order has not been paid for yet. If you were interrupted mid-payment, you can retry from your bag."}
            </p>

            <dl className="mt-8 inline-flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
              <div>
                <dt className="label text-ink-mute/60">Order</dt>
                <dd className="mt-1 font-sans text-sm text-ink">{order.orderNumber}</dd>
              </div>
              <div>
                <dt className="label text-ink-mute/60">Placed</dt>
                <dd className="mt-1 font-sans text-sm text-ink">
                  {formatDate(order.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="label text-ink-mute/60">Status</dt>
                <dd className="mt-1 font-sans text-sm text-ink">{order.status}</dd>
              </div>
              {order.payment?.razorpayPaymentId && (
                <div>
                  <dt className="label text-ink-mute/60">Payment ref</dt>
                  <dd className="mt-1 font-sans text-sm text-ink">
                    {order.payment.razorpayPaymentId}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </Reveal>

        <div className="mx-auto mt-14 max-w-3xl">
          <ul className="border-t border-ink/10">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-5 border-b border-ink/10 py-6">
                {item.imageId && (
                  <div className="w-20 shrink-0">
                    <CldImage
                      publicId={item.imageId}
                      alt={item.name}
                      ratio="3/4"
                      widths={[200]}
                      sizes="80px"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-display text-[19px] font-light text-ink">
                    {item.name}
                  </p>
                  <p className="label mt-1.5 text-ink-mute/60">
                    {item.size ? `Size ${item.size} · ` : ""}Qty {item.quantity}
                  </p>
                </div>
                <p className="shrink-0 font-sans text-sm text-ink">
                  {formatINR(item.unitPrice * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-8 grid gap-10 sm:grid-cols-2">
            {ship && (
              <div>
                <p className="label text-ink-mute">Delivering to</p>
                <address className="mt-3 font-sans text-[13px] not-italic leading-relaxed text-ink-mute">
                  {ship.fullName}
                  <br />
                  {ship.line1}
                  <br />
                  {ship.line2 ? (
                    <>
                      {ship.line2}
                      <br />
                    </>
                  ) : null}
                  {ship.city}, {ship.state} {ship.pincode}
                  <br />
                  {ship.country}
                  <br />
                  {ship.phone}
                </address>
              </div>
            )}

            <dl className="space-y-3 font-sans text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-mute">Subtotal</dt>
                <dd className="text-ink">{formatINR(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-mute">Shipping</dt>
                <dd className="text-ink">
                  {order.shipping === 0 ? "Complimentary" : formatINR(order.shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-ink/15 pt-3">
                <dt className="label self-center text-ink">Total paid</dt>
                <dd className="display text-[24px] text-ink">
                  {formatINR(order.total)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link href="/account" className="btn-dark">
              Your orders
            </Link>
            <Link href="/collections/new-arrivals" className="btn-outline">
              Continue browsing
            </Link>
          </div>
        </div>
      </div>
    </SiteChrome>
  );
}

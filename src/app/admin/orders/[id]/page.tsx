import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHead } from "@/components/admin/PageHead";
import { StatusPill } from "@/components/ui/StatusPill";
import { CldImage } from "@/components/ui/CldImage";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { formatINR } from "@/lib/money";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      payment: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
  if (!order) notFound();

  const ship = order.shipAddress as Record<string, string> | null;

  return (
    <div>
      <PageHead
        title={order.orderNumber}
        blurb={`Placed ${formatDateTime(order.createdAt)}${
          order.user ? ` by ${order.user.name}` : " as a guest"
        }`}
      />
      <Link
        href="/admin/orders"
        className="label link-sweep mt-4 inline-block text-ink-mute"
      >
        Back to orders
      </Link>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* ---- lines ---- */}
        <section className="bg-bone">
          <h2 className="label border-b border-ink/10 px-6 py-5 text-ink-mute">
            {order.items.length} {order.items.length === 1 ? "piece" : "pieces"}
          </h2>
          <ul>
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex gap-4 border-b border-ink/[0.07] px-6 py-4 last:border-0"
              >
                {item.imageId && (
                  <div className="w-14 shrink-0">
                    <CldImage
                      publicId={item.imageId}
                      alt={item.name}
                      ratio="3/4"
                      widths={[160]}
                      sizes="56px"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-[13px] text-ink">{item.name}</p>
                  <p className="label mt-1 text-ink-mute/60">
                    {item.size ? `Size ${item.size} · ` : ""}Qty {item.quantity} ·{" "}
                    {formatINR(item.unitPrice)} each
                  </p>
                </div>
                <p className="shrink-0 font-sans text-[13px] text-ink">
                  {formatINR(item.unitPrice * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="space-y-2.5 border-t border-ink/10 px-6 py-5 font-sans text-[13px]">
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
            <div className="flex justify-between border-t border-ink/10 pt-2.5">
              <dt className="label self-center text-ink">Total</dt>
              <dd className="display text-[22px] text-ink">{formatINR(order.total)}</dd>
            </div>
          </dl>
        </section>

        {/* ---- side ---- */}
        <div className="space-y-8">
          <section className="bg-bone p-6">
            <h2 className="label text-ink-mute">Fulfilment</h2>
            <div className="mt-4">
              <OrderStatusControl orderId={order.id} current={order.status} />
            </div>
          </section>

          {/* ---- payment ---- */}
          <section className="bg-bone p-6">
            <h2 className="label text-ink-mute">Payment</h2>
            {order.payment ? (
              <dl className="mt-4 space-y-3">
                {(
                  [
                    ["State", <StatusPill key="s" status={order.payment.status} />],
                    ["Amount", formatINR(order.payment.amount)],
                    ["Method", order.payment.method ?? "—"],
                    ["Razorpay order", order.payment.razorpayOrderId],
                    ["Razorpay payment", order.payment.razorpayPaymentId ?? "—"],
                    [
                      "Signature verified",
                      order.payment.razorpaySignature ? "yes" : "via webhook / no",
                    ],
                    ["Recorded", formatDateTime(order.payment.createdAt)],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label}>
                    <dt className="label text-ink-mute/60">{label}</dt>
                    <dd className="mt-1 break-all font-sans text-[12px] text-ink">
                      {value}
                    </dd>
                  </div>
                ))}
                {order.payment.errorDescription && (
                  <div>
                    <dt className="label text-oxblood">Error</dt>
                    <dd className="mt-1 font-sans text-[12px] text-oxblood">
                      {order.payment.errorCode}: {order.payment.errorDescription}
                    </dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="mt-4 font-sans text-sm text-ink-mute">
                No payment record — this order never reached the payment step.
              </p>
            )}
          </section>

          {/* ---- customer ---- */}
          <section className="bg-bone p-6">
            <h2 className="label text-ink-mute">Customer</h2>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="label text-ink-mute/60">Email</dt>
                <dd className="mt-1 break-all font-sans text-[12px] text-ink">
                  {order.email}
                </dd>
              </div>
              {order.phone && (
                <div>
                  <dt className="label text-ink-mute/60">Phone</dt>
                  <dd className="mt-1 font-sans text-[12px] text-ink">{order.phone}</dd>
                </div>
              )}
              <div>
                <dt className="label text-ink-mute/60">Account</dt>
                <dd className="mt-1 font-sans text-[12px] text-ink">
                  {order.user ? order.user.name : "Guest checkout"}
                </dd>
              </div>
            </dl>

            {ship && (
              <>
                <h3 className="label mt-6 text-ink-mute">Delivering to</h3>
                <address className="mt-3 font-sans text-[12px] not-italic leading-relaxed text-ink-mute">
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
              </>
            )}

            {order.notes && (
              <>
                <h3 className="label mt-6 text-ink-mute">Notes from the customer</h3>
                <p className="mt-2 font-sans text-[12px] leading-relaxed text-ink-mute">
                  {order.notes}
                </p>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/db";
import type { OrderStatus } from "@prisma/client";
import { PageHead } from "@/components/admin/PageHead";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatINR } from "@/lib/money";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUSES: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export default async function AdminOrders({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const statusFilter = STATUSES.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : undefined;

  const [orders, counts] = await Promise.all([
    prisma.order.findMany({
      where: {
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(q
          ? {
              OR: [
                { orderNumber: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        items: { select: { id: true } },
        payment: { select: { status: true, method: true, razorpayPaymentId: true } },
      },
    }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
  ]);

  const countFor = (s: OrderStatus) =>
    counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <div>
      <PageHead
        title="Orders"
        blurb="Moving a paid order to cancelled or refunded returns its stock to the shelf automatically."
      />

      {/* ---- status filters ---- */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`label border px-3.5 py-2.5 transition-colors ${
            !statusFilter
              ? "border-ink bg-ink text-bone"
              : "border-ink/20 text-ink-mute hover:border-ink"
          }`}
        >
          All {counts.reduce((s, c) => s + c._count, 0)}
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`label border px-3.5 py-2.5 transition-colors ${
              statusFilter === s
                ? "border-ink bg-ink text-bone"
                : "border-ink/20 text-ink-mute hover:border-ink"
            }`}
          >
            {s.toLowerCase()} {countFor(s)}
          </Link>
        ))}
      </div>

      <form className="mt-5 max-w-sm">
        {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by order number or email"
          className="field"
        />
      </form>

      <div className="mt-6 overflow-x-auto bg-bone">
        <table className="w-full min-w-[860px]">
          <thead>
            <tr className="border-b border-ink/10">
              {["Order", "Placed", "Customer", "Items", "Payment", "Status", "Total"].map(
                (h) => (
                  <th key={h} className="label px-4 py-3.5 text-left text-ink-mute/70">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-14 text-center font-sans text-sm text-ink-mute"
                >
                  No orders match.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr
                key={o.id}
                className="border-b border-ink/[0.07] transition-colors last:border-0 hover:bg-bone-warm"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="font-sans text-[13px] text-ink underline-offset-4 hover:underline"
                  >
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 font-sans text-[12px] text-ink-mute">
                  {formatDateTime(o.createdAt)}
                </td>
                <td className="px-4 py-3 font-sans text-[12px] text-ink-mute">
                  {o.email}
                </td>
                <td className="px-4 py-3 font-sans text-[13px] text-ink-mute">
                  {o.items.length}
                </td>
                <td className="px-4 py-3">
                  {o.payment ? (
                    <span className="flex flex-col gap-1">
                      <StatusPill status={o.payment.status} />
                      <span className="label text-ink-mute/50">
                        {o.payment.method ?? "—"}
                      </span>
                    </span>
                  ) : (
                    <span className="label text-ink-mute/50">none</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={o.status} />
                </td>
                <td className="px-4 py-3 font-sans text-[13px] text-ink">
                  {formatINR(o.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

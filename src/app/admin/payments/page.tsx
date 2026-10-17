import Link from "next/link";
import { prisma } from "@/lib/db";
import type { PaymentStatus } from "@prisma/client";
import { PageHead } from "@/components/admin/PageHead";
import { StatusPill } from "@/components/ui/StatusPill";
import { StatCard } from "@/components/admin/StatCard";
import { formatINR } from "@/lib/money";
import { formatDateTime } from "@/lib/utils";
import { razorpayConfigured } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

const STATUSES: PaymentStatus[] = [
  "CREATED",
  "AUTHORIZED",
  "CAPTURED",
  "FAILED",
  "REFUNDED",
];

export default async function AdminPayments({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const statusFilter = STATUSES.includes(status as PaymentStatus)
    ? (status as PaymentStatus)
    : undefined;

  const [payments, captured, failed, refunded, counts] = await Promise.all([
    prisma.payment.findMany({
      where: {
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(q
          ? {
              OR: [
                { razorpayOrderId: { contains: q, mode: "insensitive" } },
                { razorpayPaymentId: { contains: q, mode: "insensitive" } },
                { order: { orderNumber: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        order: { select: { id: true, orderNumber: true, email: true, status: true } },
      },
    }),
    prisma.payment.aggregate({
      where: { status: "CAPTURED" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.count({ where: { status: "FAILED" } }),
    prisma.payment.aggregate({
      where: { status: "REFUNDED" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.groupBy({ by: ["status"], _count: true }),
  ]);

  const countFor = (s: PaymentStatus) =>
    counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <div>
      <PageHead
        title="Payments"
        blurb="Every Razorpay transaction, with its provider references for reconciliation. Captures arrive either from the checkout handback or the webhook — whichever reaches us first."
      />

      {!razorpayConfigured() && (
        <p className="mt-6 border-l-2 border-gold bg-gold/5 px-5 py-4 font-sans text-sm leading-relaxed text-ink-mute">
          <strong className="font-medium text-ink">Razorpay is not configured.</strong>{" "}
          Add <code className="text-ink">RAZORPAY_KEY_ID</code>,{" "}
          <code className="text-ink">RAZORPAY_KEY_SECRET</code> and{" "}
          <code className="text-ink">RAZORPAY_WEBHOOK_SECRET</code> to{" "}
          <code className="text-ink">.env</code>, and point the dashboard webhook
          at <code className="text-ink">/api/webhooks/razorpay</code>.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon="rupee"
          label="Captured"
          value={formatINR(captured._sum.amount ?? 0)}
          sub={`${captured._count} successful payment${captured._count === 1 ? "" : "s"}`}
        />
        <StatCard
          icon="card"
          label="Refunded"
          value={formatINR(refunded._sum.amount ?? 0)}
          sub={`${refunded._count} refund${refunded._count === 1 ? "" : "s"}`}
        />
        <StatCard
          icon="receipt"
          label="Failed attempts"
          value={String(failed)}
          sub={failed > 0 ? "Worth following up" : "None"}
          tone={failed > 0 ? "warn" : "default"}
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/admin/payments"
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
            href={`/admin/payments?status=${s}`}
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

      <form className="mt-5 max-w-md">
        {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by order number, or a Razorpay order / payment id"
          className="field"
        />
      </form>

      <div className="mt-6 overflow-x-auto bg-bone">
        <table className="w-full min-w-[920px]">
          <thead>
            <tr className="border-b border-ink/10">
              {[
                "Order",
                "Recorded",
                "Razorpay refs",
                "Method",
                "State",
                "Order state",
                "Amount",
              ].map((h) => (
                <th key={h} className="label px-4 py-3.5 text-left text-ink-mute/70">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-14 text-center font-sans text-sm text-ink-mute"
                >
                  No payments match.
                </td>
              </tr>
            )}
            {payments.map((p) => (
              <tr
                key={p.id}
                className="border-b border-ink/[0.07] transition-colors last:border-0 hover:bg-bone-warm"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${p.order.id}`}
                    className="font-sans text-[13px] text-ink underline-offset-4 hover:underline"
                  >
                    {p.order.orderNumber}
                  </Link>
                  <p className="label mt-0.5 text-ink-mute/50">{p.order.email}</p>
                </td>
                <td className="px-4 py-3 font-sans text-[12px] text-ink-mute">
                  {formatDateTime(p.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <p className="break-all font-sans text-[11px] text-ink-mute">
                    {p.razorpayOrderId}
                  </p>
                  {p.razorpayPaymentId && (
                    <p className="break-all font-sans text-[11px] text-ink">
                      {p.razorpayPaymentId}
                    </p>
                  )}
                  {p.errorDescription && (
                    <p className="mt-1 font-sans text-[11px] text-oxblood">
                      {p.errorCode}: {p.errorDescription}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 font-sans text-[12px] text-ink-mute">
                  {p.method ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={p.status} />
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={p.order.status} />
                </td>
                <td className="px-4 py-3 font-sans text-[13px] text-ink">
                  {formatINR(p.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

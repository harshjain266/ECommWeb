import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHead } from "@/components/admin/PageHead";
import { StatusPill } from "@/components/ui/StatusPill";
import { CldImage } from "@/components/ui/CldImage";
import { StatCard } from "@/components/admin/StatCard";
import { formatINR } from "@/lib/money";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [
    revenueAll,
    revenue30,
    orderCount,
    pendingCount,
    productCount,
    lowStock,
    customerCount,
    recentOrders,
    recentPayments,
  ] = await Promise.all([
    // Revenue counts only money actually captured.
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: {
        status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
        createdAt: { gte: since },
      },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.productVariant.findMany({
      where: { stock: { lte: 1 }, size: { not: "Bespoke" } },
      take: 6,
      orderBy: { stock: "asc" },
      include: { product: { select: { name: true, slug: true, id: true } } },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        items: { take: 1, select: { imageId: true, name: true } },
        payment: { select: { status: true, method: true } },
      },
    }),
    prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { order: { select: { orderNumber: true, id: true } } },
    }),
  ]);

  return (
    <div>
      <PageHead
        title="Dashboard"
        blurb="Revenue is counted from captured payments only — pending orders are listed separately so they can be chased."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="rupee"
          label="Revenue, all time"
          value={formatINR(revenueAll._sum.total ?? 0)}
          sub={`${formatINR(revenue30._sum.total ?? 0)} in the last 30 days`}
        />
        <StatCard
          icon="receipt"
          label="Orders"
          value={String(orderCount)}
          sub={
            pendingCount > 0
              ? `${pendingCount} awaiting payment`
              : "None awaiting payment"
          }
          tone={pendingCount > 0 ? "warn" : "default"}
        />
        <StatCard
          icon="package"
          label="Live products"
          value={String(productCount)}
          sub={`${lowStock.length} sizes at or below 1 in stock`}
          tone={lowStock.length > 0 ? "warn" : "default"}
        />
        <StatCard
          icon="users"
          label="Customers"
          value={String(customerCount)}
          sub={`${revenue30._count} orders in 30 days`}
        />
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[1.5fr_1fr]">
        {/* ---- recent orders ---- */}
        {/* min-w-0: grid tracks default to min-content, which lets a long
            order row widen the column past the phone viewport. */}
        <section className="min-w-0 bg-bone">
          <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
            <h2 className="label text-ink-mute">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="label link-sweep flex items-center gap-1 text-ink-mute"
            >
              All orders
              <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="px-6 py-12 text-center font-sans text-sm text-ink-mute">
              No orders yet.
            </p>
          ) : (
            <ul>
              {recentOrders.map((order) => (
                <li key={order.id} className="border-b border-ink/[0.07] last:border-0">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-bone-warm"
                  >
                    {order.items[0]?.imageId && (
                      <div className="w-11 shrink-0">
                        <CldImage
                          publicId={order.items[0].imageId!}
                          alt={order.items[0].name}
                          ratio="3/4"
                          widths={[120]}
                          sizes="44px"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-sans text-[13px] text-ink">{order.orderNumber}</p>
                      <p className="label mt-0.5 truncate text-ink-mute/60">
                        {order.email} &#183; {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <StatusPill status={order.status} />
                    <p className="shrink-0 font-sans text-[13px] text-ink">
                      {formatINR(order.total)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="min-w-0 space-y-8">
          {/* ---- payments ---- */}
          <section className="bg-bone">
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
              <h2 className="label text-ink-mute">Latest payments</h2>
              <Link
                href="/admin/payments"
                className="label link-sweep flex items-center gap-1 text-ink-mute"
              >
                All
                <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
              </Link>
            </div>
            {recentPayments.length === 0 ? (
              <p className="px-6 py-10 text-center font-sans text-sm text-ink-mute">
                No payments yet.
              </p>
            ) : (
              <ul>
                {recentPayments.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 border-b border-ink/[0.07] px-6 py-4 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-sans text-[13px] text-ink">
                        {p.order.orderNumber}
                      </p>
                      <p className="label mt-0.5 truncate text-ink-mute/60">
                        {p.method ?? "—"} &#183;{" "}
                        {p.razorpayPaymentId ?? p.razorpayOrderId}
                      </p>
                    </div>
                    <StatusPill status={p.status} />
                    <p className="shrink-0 font-sans text-[13px] text-ink">
                      {formatINR(p.amount)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ---- low stock ---- */}
          <section className="bg-bone">
            <div className="border-b border-ink/10 px-6 py-5">
              <h2 className="label text-ink-mute">Running low</h2>
            </div>
            {lowStock.length === 0 ? (
              <p className="px-6 py-10 text-center font-sans text-sm text-ink-mute">
                Every size is in stock.
              </p>
            ) : (
              <ul>
                {lowStock.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between gap-3 border-b border-ink/[0.07] px-6 py-3.5 last:border-0"
                  >
                    <Link
                      href={`/admin/products/${v.product.id}`}
                      className="min-w-0 flex-1"
                    >
                      <p className="truncate font-sans text-[13px] text-ink">
                        {v.product.name}
                      </p>
                      <p className="label mt-0.5 text-ink-mute/60">Size {v.size}</p>
                    </Link>
                    <span
                      className={`label px-2 py-1 ${
                        v.stock === 0
                          ? "bg-oxblood text-bone"
                          : "bg-gold-pale text-ink"
                      }`}
                    >
                      {v.stock} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

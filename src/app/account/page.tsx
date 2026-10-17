import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { SiteChrome } from "@/components/site/SiteChrome";
import { CldImage } from "@/components/ui/CldImage";
import { Reveal } from "@/components/ui/Reveal";
import { LogoutButton } from "@/components/site/LogoutButton";
import { requireUser } from "@/lib/auth";
import { formatINR } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { StatusPill } from "@/components/ui/StatusPill";

export const metadata: Metadata = { title: "Your account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await requireUser("/account");

  const [user, orders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, phone: true, createdAt: true, role: true },
    }),
    prisma.order.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      include: { items: true, payment: { select: { status: true, method: true } } },
    }),
  ]);

  const addresses = await prisma.address.findMany({
    where: { userId: session.userId },
    orderBy: [{ isDefault: "desc" }, { id: "desc" }],
  });

  return (
    <SiteChrome>
      <div className="shell py-12 lg:py-16">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="label text-gold">Your account</p>
            <h1 className="display mt-4 text-[clamp(2.2rem,6vw,3.4rem)] text-ink">
              {user?.name}
            </h1>
            <p className="mt-2 font-sans text-sm text-ink-mute">
              {user?.email}
              {user?.phone ? ` · ${user.phone}` : ""} · with us since{" "}
              {user ? formatDate(user.createdAt) : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user?.role === "ADMIN" && (
              <Link href="/admin" className="btn-gold">
                Admin dashboard
              </Link>
            )}
            <LogoutButton />
          </div>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          {/* ---- orders ---- */}
          <section>
            <h2 className="label text-ink-mute">
              Orders &#183; {orders.length}
            </h2>

            {orders.length === 0 ? (
              <div className="mt-6 border border-ink/10 px-6 py-14 text-center">
                <p className="font-display text-xl font-light text-ink">
                  No orders yet
                </p>
                <p className="mt-2 font-sans text-sm text-ink-mute">
                  Your commissions will be listed here.
                </p>
                <Link href="/collections/bridal" className="btn-dark mt-7">
                  Browse the collections
                </Link>
              </div>
            ) : (
              <ul className="mt-6 space-y-4">
                {orders.map((order, i) => (
                  <Reveal key={order.id} delay={i * 0.05}>
                    <li className="border border-ink/10 p-5 transition-colors hover:border-ink/25">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="font-sans text-sm text-ink">
                            {order.orderNumber}
                          </p>
                          <p className="label mt-1 text-ink-mute/60">
                            {formatDate(order.createdAt)} &#183;{" "}
                            {order.items.length}{" "}
                            {order.items.length === 1 ? "piece" : "pieces"}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <StatusPill status={order.status} />
                          <p className="font-sans text-sm text-ink">
                            {formatINR(order.total)}
                          </p>
                        </div>
                      </div>

                      <ul className="mt-5 flex gap-3">
                        {order.items.slice(0, 4).map((item) => (
                          <li key={item.id} className="w-14">
                            {item.imageId && (
                              <CldImage
                                publicId={item.imageId}
                                alt={item.name}
                                ratio="3/4"
                                widths={[160]}
                                sizes="56px"
                              />
                            )}
                          </li>
                        ))}
                        {order.items.length > 4 && (
                          <li className="label flex w-14 items-center justify-center bg-bone-warm text-ink-mute">
                            +{order.items.length - 4}
                          </li>
                        )}
                      </ul>

                      <Link
                        href={`/order/${order.id}`}
                        className="label link-sweep mt-5 inline-block text-ink-mute"
                      >
                        View order
                      </Link>
                    </li>
                  </Reveal>
                ))}
              </ul>
            )}
          </section>

          {/* ---- addresses ---- */}
          <section>
            <h2 className="label text-ink-mute">Saved addresses</h2>
            {addresses.length === 0 ? (
              <p className="mt-6 border border-ink/10 px-5 py-8 text-center font-sans text-sm text-ink-mute">
                Your delivery address is saved automatically at checkout.
              </p>
            ) : (
              <ul className="mt-6 space-y-4">
                {addresses.map((a) => (
                  <li key={a.id} className="bg-bone-warm p-5">
                    {a.isDefault && (
                      <p className="label mb-2 text-gold">Default</p>
                    )}
                    <address className="font-sans text-[13px] not-italic leading-relaxed text-ink-mute">
                      <span className="text-ink">{a.fullName}</span>
                      <br />
                      {a.line1}
                      <br />
                      {a.line2 ? (
                        <>
                          {a.line2}
                          <br />
                        </>
                      ) : null}
                      {a.city}, {a.state} {a.pincode}
                      <br />
                      {a.country}
                      <br />
                      {a.phone}
                    </address>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8 bg-ink p-6 text-bone">
              <p className="label text-gold-light">The bridal studio</p>
              <p className="mt-3 font-display text-[21px] font-light leading-snug">
                Planning a wedding?
              </p>
              <p className="mt-2 font-sans text-[13px] leading-relaxed text-bone/60">
                Commissions open about nine months ahead. Book a first
                consultation and we will hold a slot.
              </p>
              <Link href="/atelier" className="btn-outline-light mt-5 w-full">
                Request an appointment
              </Link>
            </div>
          </section>
        </div>
      </div>
    </SiteChrome>
  );
}

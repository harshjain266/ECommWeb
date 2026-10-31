import Link from "next/link";
import type { CommissionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PageHead } from "@/components/admin/PageHead";
import { StatCard } from "@/components/admin/StatCard";
import { CommissionStatusControl } from "@/components/admin/CommissionStatusControl";
import { CldImage } from "@/components/ui/CldImage";
import { formatDateTime } from "@/lib/utils";
import { mailConfigured } from "@/lib/mail";
import { imageUrl, videoUrl } from "@/lib/media";

export const dynamic = "force-dynamic";

const STATUSES: CommissionStatus[] = [
  "NEW",
  "REVIEWING",
  "QUOTED",
  "IN_PROGRESS",
  "DELIVERED",
  "CLOSED",
];

const pretty = (s: string) =>
  s.toLowerCase().split("_").join(" ").replace(/^./, (c) => c.toUpperCase());

export default async function AdminCommissions({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = STATUSES.includes(status as CommissionStatus)
    ? (status as CommissionStatus)
    : undefined;

  const [commissions, counts, unnotified, unpaid] = await Promise.all([
    prisma.commission.findMany({
      where: filter ? { status: filter } : {},
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.commission.groupBy({ by: ["status"], _count: true }),
    prisma.commission.count({ where: { notified: false } }),
    prisma.commission.count({
      where: { feePaid: false, status: { notIn: ["NEW", "CLOSED"] } },
    }),
  ]);

  const countFor = (s: CommissionStatus) =>
    counts.find((c) => c.status === s)?._count ?? 0;
  const total = counts.reduce((n, c) => n + c._count, 0);

  return (
    <div>
      <PageHead
        title="Commissions"
        blurb="Bespoke jewellery briefs, newest first. Every brief is saved here the moment it is sent, whether or not the email went out."
      />

      {!mailConfigured() && (
        <p className="mt-6 border-l-2 border-oxblood bg-oxblood/5 px-4 py-3 font-sans text-sm text-oxblood">
          Email is not configured, so nobody is notified when a brief comes in —
          this list is the only place they appear. Set <code>RESEND_API_KEY</code>,{" "}
          <code>MAIL_FROM</code> and <code>ATELIER_EMAIL</code> in{" "}
          <code>.env</code> and restart.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="sparkles" label="All briefs" value={String(total)} />
        <StatCard icon="calendar" label="New" value={String(countFor("NEW"))} />
        <StatCard icon="check" label="Fee unpaid, in progress" value={String(unpaid)} />
        <StatCard icon="alert" label="Not emailed" value={String(unnotified)} />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/admin/commissions"
          className={`label px-3 py-2 ${!filter ? "bg-ink text-bone" : "bg-bone-warm text-ink"}`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/commissions?status=${s}`}
            className={`label px-3 py-2 ${
              filter === s ? "bg-ink text-bone" : "bg-bone-warm text-ink"
            }`}
          >
            {pretty(s)} ({countFor(s)})
          </Link>
        ))}
      </div>

      {commissions.length === 0 ? (
        <p className="mt-10 font-sans text-sm text-ink-mute">No briefs yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse font-sans text-[13px]">
            <thead>
              <tr className="border-b border-ink/15 text-left">
                <th className="label py-3 pr-4 text-ink-mute">Received</th>
                <th className="label py-3 pr-4 text-ink-mute">Who</th>
                <th className="label py-3 pr-4 text-ink-mute">Reference</th>
                <th className="label py-3 pr-4 text-ink-mute">Brief</th>
                <th className="label py-3 pr-4 text-ink-mute">Triage</th>
                <th className="label py-3 pr-4 text-ink-mute">Status</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((c) => (
                <tr key={c.id} className="border-b border-ink/[0.07] align-top">
                  <td className="whitespace-nowrap py-4 pr-4 text-ink-mute">
                    {formatDateTime(c.createdAt)}
                    <span className="label mt-1.5 block text-ink">{c.reference}</span>
                    {!c.notified && (
                      <span
                        className="label mt-1.5 block text-oxblood"
                        title={c.notifyError ?? "Not emailed"}
                      >
                        not emailed
                      </span>
                    )}
                  </td>

                  <td className="py-4 pr-4">
                    <span className="text-ink">{c.name}</span>
                    <br />
                    <a
                      href={`tel:${c.phone}`}
                      className="text-ink-mute hover:text-oxblood"
                    >
                      {c.phone}
                    </a>
                    <br />
                    <a
                      href={`mailto:${c.email}`}
                      className="text-ink-mute hover:text-oxblood"
                    >
                      {c.email}
                    </a>
                  </td>

                  <td className="py-4 pr-4">
                    {c.publicId ? (
                      <a
                        href={
                          c.mediaKind === "VIDEO"
                            ? videoUrl(c.publicId, { width: 1280 })
                            : imageUrl(c.publicId, { width: 1600 })
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-24"
                      >
                        <CldImage
                          publicId={c.publicId}
                          fromVideo={c.mediaKind === "VIDEO"}
                          alt={`Reference sent by ${c.name}`}
                          ratio="1/1"
                          sizes="96px"
                          widths={[200, 400]}
                        />
                      </a>
                    ) : (
                      <span className="text-ink-mute/60">none</span>
                    )}
                  </td>

                  <td className="max-w-sm py-4 pr-4 text-ink-mute">
                    {c.brief ? (
                      <span className="whitespace-pre-wrap">{c.brief}</span>
                    ) : (
                      <span className="text-ink-mute/60">—</span>
                    )}
                  </td>

                  <td className="py-4 pr-4 text-ink-mute">
                    {c.budget && (
                      <span className="block text-ink">{c.budget}</span>
                    )}
                    {c.wearDate && <span className="block">by {c.wearDate}</span>}
                    {c.metal && <span className="block">{c.metal}</span>}
                    {c.stones && <span className="block">{c.stones}</span>}
                    {!c.budget && !c.wearDate && !c.metal && !c.stones && (
                      <span className="text-ink-mute/60">—</span>
                    )}
                  </td>

                  <td className="py-4 pr-4">
                    <CommissionStatusControl
                      id={c.id}
                      current={c.status}
                      feePaid={c.feePaid}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

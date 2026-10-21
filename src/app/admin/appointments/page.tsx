import { prisma } from "@/lib/db";
import type { AppointmentStatus } from "@prisma/client";
import Link from "next/link";
import { PageHead } from "@/components/admin/PageHead";
import { StatCard } from "@/components/admin/StatCard";
import { AppointmentStatusControl } from "@/components/admin/AppointmentStatusControl";
import { formatDateTime } from "@/lib/utils";
import { mailConfigured } from "@/lib/mail";

export const dynamic = "force-dynamic";

const STATUSES: AppointmentStatus[] = ["NEW", "CONTACTED", "SCHEDULED", "CLOSED"];

export default async function AdminAppointments({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = STATUSES.includes(status as AppointmentStatus)
    ? (status as AppointmentStatus)
    : undefined;

  const [appointments, counts, unnotified] = await Promise.all([
    prisma.appointment.findMany({
      where: filter ? { status: filter } : {},
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.appointment.groupBy({ by: ["status"], _count: true }),
    prisma.appointment.count({ where: { notified: false } }),
  ]);

  const countFor = (s: AppointmentStatus) =>
    counts.find((c) => c.status === s)?._count ?? 0;
  const total = counts.reduce((n, c) => n + c._count, 0);

  return (
    <div>
      <PageHead
        title="Appointments"
        blurb="Consultation and fitting requests, newest first. Every request is saved here the moment it is submitted, whether or not the email went out."
      />

      {!mailConfigured() && (
        <p className="mt-6 border-l-2 border-oxblood bg-oxblood/5 px-4 py-3 font-sans text-sm text-oxblood">
          Email is not configured, so nobody is notified when a request comes
          in — this list is the only place they appear. Set{" "}
          <code>RESEND_API_KEY</code>, <code>MAIL_FROM</code> and{" "}
          <code>ATELIER_EMAIL</code> in <code>.env</code> and restart.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="calendar" label="All requests" value={String(total)} />
        <StatCard icon="sparkles" label="New" value={String(countFor("NEW"))} />
        <StatCard
          icon="check"
          label="Scheduled"
          value={String(countFor("SCHEDULED"))}
        />
        <StatCard icon="alert" label="Not emailed" value={String(unnotified)} />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/admin/appointments"
          className={`label px-3 py-2 ${!filter ? "bg-ink text-bone" : "bg-bone-warm text-ink"}`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/appointments?status=${s}`}
            className={`label px-3 py-2 ${
              filter === s ? "bg-ink text-bone" : "bg-bone-warm text-ink"
            }`}
          >
            {s[0] + s.slice(1).toLowerCase()} ({countFor(s)})
          </Link>
        ))}
      </div>

      {appointments.length === 0 ? (
        <p className="mt-10 font-sans text-sm text-ink-mute">
          No requests yet.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse font-sans text-[13px]">
            <thead>
              <tr className="border-b border-ink/15 text-left">
                <th className="label py-3 pr-4 text-ink-mute">Received</th>
                <th className="label py-3 pr-4 text-ink-mute">Who</th>
                <th className="label py-3 pr-4 text-ink-mute">Piece / occasion</th>
                <th className="label py-3 pr-4 text-ink-mute">Message</th>
                <th className="label py-3 pr-4 text-ink-mute">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id} className="border-b border-ink/[0.07] align-top">
                  <td className="py-4 pr-4 text-ink-mute whitespace-nowrap">
                    {formatDateTime(a.createdAt)}
                    {!a.notified && (
                      <span
                        className="label mt-1.5 block text-oxblood"
                        title={a.notifyError ?? "Not emailed"}
                      >
                        not emailed
                      </span>
                    )}
                  </td>
                  <td className="py-4 pr-4">
                    <span className="text-ink">{a.name}</span>
                    <br />
                    <a href={`tel:${a.phone}`} className="text-ink-mute hover:text-oxblood">
                      {a.phone}
                    </a>
                    <br />
                    <a href={`mailto:${a.email}`} className="text-ink-mute hover:text-oxblood">
                      {a.email}
                    </a>
                  </td>
                  <td className="py-4 pr-4">
                    {a.piece && <span className="text-ink">{a.piece}</span>}
                    {a.piece && (a.occasion || a.date) && <br />}
                    {a.occasion && <span className="text-ink-mute">{a.occasion}</span>}
                    {a.date && (
                      <>
                        <br />
                        <span className="text-ink-mute/70">{a.date}</span>
                      </>
                    )}
                  </td>
                  <td className="max-w-sm py-4 pr-4 text-pretty text-ink-mute">
                    {a.message ?? "—"}
                  </td>
                  <td className="py-4 pr-4">
                    <AppointmentStatusControl id={a.id} current={a.status} />
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

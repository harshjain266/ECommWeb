import { prisma } from "@/lib/db";
import { PageHead } from "@/components/admin/PageHead";
import { UserRoleControl } from "@/components/admin/UserRoleControl";
import { getSession } from "@/lib/session";
import { formatINR } from "@/lib/money";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const session = await getSession();

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    include: {
      orders: {
        where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
        select: { total: true },
      },
      _count: { select: { orders: true } },
    },
  });

  return (
    <div>
      <PageHead
        title="Customers & access"
        blurb="Promoting someone to administrator gives them this console. The last administrator cannot be demoted, and you cannot remove your own access."
      />

      <form className="mt-6 max-w-sm">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or email"
          className="field"
        />
      </form>

      <div className="mt-6 overflow-x-auto bg-bone">
        <table className="w-full min-w-[780px]">
          <thead>
            <tr className="border-b border-ink/10">
              {["Name", "Email", "Joined", "Orders", "Lifetime value", "Access"].map(
                (h) => (
                  <th key={h} className="label px-4 py-3.5 text-left text-ink-mute/70">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-14 text-center font-sans text-sm text-ink-mute"
                >
                  No one matches that search.
                </td>
              </tr>
            )}
            {users.map((u) => {
              const ltv = u.orders.reduce((s, o) => s + o.total, 0);
              return (
                <tr
                  key={u.id}
                  className="border-b border-ink/[0.07] transition-colors last:border-0 hover:bg-bone-warm"
                >
                  <td className="px-4 py-3">
                    <p className="font-sans text-[13px] text-ink">{u.name}</p>
                    {u.phone && (
                      <p className="label mt-0.5 text-ink-mute/50">{u.phone}</p>
                    )}
                    {u.id === session?.userId && (
                      <p className="label mt-0.5 text-gold">that's you</p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-sans text-[12px] text-ink-mute">
                    {u.email}
                  </td>
                  <td className="px-4 py-3 font-sans text-[12px] text-ink-mute">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-sans text-[13px] text-ink-mute">
                    {u._count.orders}
                  </td>
                  <td className="px-4 py-3 font-sans text-[13px] text-ink">
                    {formatINR(ltv)}
                  </td>
                  <td className="px-4 py-3">
                    <UserRoleControl
                      userId={u.id}
                      role={u.role}
                      name={u.name}
                      isSelf={u.id === session?.userId}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHead } from "@/components/admin/PageHead";
import { CldImage } from "@/components/ui/CldImage";
import { NoImage } from "@/components/ui/NoImage";
import { formatINR } from "@/lib/money";
import { ProductRowActions } from "@/components/admin/ProductRowActions";

export const dynamic = "force-dynamic";

export default async function AdminProducts({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const products = await prisma.product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ isActive: "desc" }, { position: "asc" }],
    include: {
      category: { select: { name: true } },
      media: { orderBy: { position: "asc" }, take: 1 },
      variants: { select: { stock: true } },
      _count: { select: { orderItems: true } },
    },
  });

  return (
    <div>
      <PageHead
        title="Products"
        blurb="Each piece carries its own gallery of stills and clips, its sizes and its stock. Deactivating hides a piece from the storefront without touching order history."
        action={{ href: "/admin/products/new", label: "New product" }}
      />

      <form className="mt-6 max-w-sm">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or SKU"
          className="field"
        />
      </form>

      <div className="mt-6 overflow-x-auto bg-bone">
        <table className="w-full min-w-[840px]">
          <thead>
            <tr className="border-b border-ink/10">
              {["Piece", "Category", "Price", "Stock", "Orders", "State", ""].map(
                (h) => (
                  <th key={h} className="label px-4 py-3.5 text-left text-ink-mute/70">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-14 text-center font-sans text-sm text-ink-mute"
                >
                  {q ? "Nothing matches that search." : "No products yet."}
                </td>
              </tr>
            )}

            {products.map((p) => {
              const stock = p.variants.reduce((s, v) => s + v.stock, 0);
              return (
                <tr
                  key={p.id}
                  className="border-b border-ink/[0.07] transition-colors last:border-0 hover:bg-bone-warm"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="flex items-center gap-3"
                    >
                      <span className="w-11 shrink-0">
                        {p.media[0] ? (
                          <CldImage
                            publicId={p.media[0].publicId}
                            alt={p.name}
                            ratio="3/4"
                            widths={[120]}
                            sizes="44px"
                            fromVideo={p.media[0].kind === "VIDEO"}
                          />
                        ) : (
                          <NoImage label="No image" compact className="w-full" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-sans text-[13px] text-ink">
                          {p.name}
                        </span>
                        <span className="label mt-0.5 block text-ink-mute/60">
                          {p.sku}
                          {p.isFeatured ? " · featured" : ""}
                          {p.isNewArrival ? " · new" : ""}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-sans text-[13px] text-ink-mute">
                    {p.category?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-sans text-[13px] text-ink">
                    {formatINR(p.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`label px-2 py-1 ${
                        stock === 0
                          ? "bg-oxblood text-bone"
                          : stock <= 5
                            ? "bg-gold-pale text-ink"
                            : "bg-bone-warm text-ink-mute"
                      }`}
                    >
                      {stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans text-[13px] text-ink-mute">
                    {p._count.orderItems}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`label px-2 py-1 ${
                        p.isActive ? "bg-ink text-bone" : "bg-bone-warm text-ink-mute/70"
                      }`}
                    >
                      {p.isActive ? "live" : "hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ProductRowActions
                      id={p.id}
                      slug={p.slug}
                      name={p.name}
                      isActive={p.isActive}
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

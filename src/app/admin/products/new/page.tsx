import { PageHead } from "@/components/admin/PageHead";
import { ProductForm } from "@/components/admin/ProductForm";
import { getCategoryOptions } from "@/lib/category-options";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategoryOptions();
  return (
    <div>
      <PageHead
        title="New product"
        blurb="Attach stills and clips from the media library — nothing is uploaded twice, and the gallery order is the order you drag them into."
      />
      <ProductForm categories={categories} />
    </div>
  );
}

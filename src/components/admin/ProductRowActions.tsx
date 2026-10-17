"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, Pencil, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";

export function ProductRowActions({
  id,
  slug,
  name,
  isActive,
}: {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  async function toggleActive() {
    if (
      isActive &&
      !confirm(`Hide "${name}" from the storefront? Order history is unaffected.`)
    ) {
      return;
    }
    setPending(true);

    // Hiding goes through DELETE (which soft-deletes); re-showing needs the
    // full editor, so send the admin there with a note.
    if (isActive) {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      setPending(false);
      if (!res.ok) {
        toast(data.error ?? "Could not hide the product", "error");
        return;
      }
      toast(data.reason ?? "Hidden from the storefront");
      router.refresh();
      return;
    }

    setPending(false);
    router.push(`/admin/products/${id}`);
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/product/${slug}`}
        target="_blank"
        title="View on the storefront"
        className="p-2 text-ink-mute/60 transition-colors hover:text-ink"
      >
        <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
      </Link>
      <Link
        href={`/admin/products/${id}`}
        title="Edit"
        className="p-2 text-ink-mute/60 transition-colors hover:text-ink"
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
      </Link>
      <button
        type="button"
        onClick={toggleActive}
        disabled={pending}
        title={isActive ? "Hide from storefront" : "Edit to republish"}
        className="p-2 text-ink-mute/60 transition-colors hover:text-oxblood"
      >
        {pending ? (
          <Spinner className="h-3.5 w-3.5" />
        ) : (
          <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} />
        )}
      </button>
    </div>
  );
}

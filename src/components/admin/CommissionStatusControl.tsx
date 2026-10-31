"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";

const STATUSES = [
  "NEW",
  "REVIEWING",
  "QUOTED",
  "IN_PROGRESS",
  "DELIVERED",
  "CLOSED",
] as const;

const pretty = (s: string) =>
  s
    .toLowerCase()
    .split("_")
    .map((w, i) => (i === 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");

export function CommissionStatusControl({
  id,
  current,
  feePaid,
}: {
  id: string;
  current: string;
  feePaid: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  async function patch(body: Record<string, unknown>, note: string) {
    setPending(true);
    const res = await fetch(`/api/admin/commissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);

    if (!res.ok) {
      toast(data.error ?? "Could not update", "error");
      return;
    }
    toast(note);
    router.refresh();
  }

  return (
    <span className="inline-flex flex-col items-start gap-2">
      <span className="inline-flex items-center gap-2">
        <select
          value={current}
          disabled={pending}
          onChange={(e) => patch({ status: e.target.value }, `Marked ${pretty(e.target.value).toLowerCase()}`)}
          className="field py-1.5 text-[12px]"
          aria-label="Commission status"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {pretty(s)}
            </option>
          ))}
        </select>
        {pending && <Spinner />}
      </span>

      {/* The fee is taken outside the site — a link sent by hand — so this is
          simply the atelier recording that it landed. */}
      <label className="flex cursor-pointer items-center gap-2 font-sans text-[12px] text-ink-mute">
        <input
          type="checkbox"
          checked={feePaid}
          disabled={pending}
          onChange={(e) =>
            patch(
              { feePaid: e.target.checked },
              e.target.checked ? "Design fee marked paid" : "Design fee marked unpaid",
            )
          }
          className="h-3.5 w-3.5 accent-ink"
        />
        Design fee paid
      </label>
    </span>
  );
}

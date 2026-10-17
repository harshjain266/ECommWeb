"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";

const STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

const RELEASES_STOCK = new Set(["CANCELLED", "REFUNDED"]);

export function OrderStatusControl({
  orderId,
  current,
}: {
  orderId: string;
  current: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [status, setStatus] = useState(current);
  const [pending, setPending] = useState(false);

  async function save() {
    if (status === current) return;

    // Releasing stock is not something to do by accident.
    if (RELEASES_STOCK.has(status) && !RELEASES_STOCK.has(current)) {
      if (
        !confirm(
          `Mark this order ${status.toLowerCase()}? Any stock it reserved will be returned to the shelf.`,
        )
      ) {
        return;
      }
    }

    setPending(true);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);

    if (!res.ok) {
      toast(data.error ?? "Could not update the order", "error");
      return;
    }
    toast(`Order marked ${status.toLowerCase()}`);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <label htmlFor="status" className="field-label">
        Status
      </label>
      <select
        id="status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="field"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.toLowerCase()}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={save}
        disabled={pending || status === current}
        className="btn-dark w-full"
      >
        {pending ? <Spinner /> : status === current ? "No change" : "Update status"}
      </button>
    </div>
  );
}

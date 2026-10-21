"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";

const STATUSES = ["NEW", "CONTACTED", "SCHEDULED", "CLOSED"] as const;

export function AppointmentStatusControl({
  id,
  current,
}: {
  id: string;
  current: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  async function save(status: string) {
    if (status === current) return;
    setPending(true);

    const res = await fetch(`/api/admin/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);

    if (!res.ok) {
      toast(data.error ?? "Could not update", "error");
      return;
    }
    toast(`Marked ${status.toLowerCase()}`);
    router.refresh();
  }

  return (
    <span className="inline-flex items-center gap-2">
      <select
        value={current}
        disabled={pending}
        onChange={(e) => save(e.target.value)}
        className="field py-1.5 text-[12px]"
        aria-label="Appointment status"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s[0] + s.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
      {pending && <Spinner />}
    </span>
  );
}

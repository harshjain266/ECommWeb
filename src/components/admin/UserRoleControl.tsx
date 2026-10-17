"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";

export function UserRoleControl({
  userId,
  role,
  name,
  isSelf,
}: {
  userId: string;
  role: "ADMIN" | "CUSTOMER";
  name: string;
  isSelf: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const next = role === "ADMIN" ? "CUSTOMER" : "ADMIN";

  async function change() {
    if (
      !confirm(
        next === "ADMIN"
          ? `Give ${name} administrator access? They will be able to edit products, see every order and take payments data.`
          : `Remove ${name}'s administrator access?`,
      )
    ) {
      return;
    }

    setPending(true);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: next }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);

    if (!res.ok) {
      toast(data.error ?? "Could not change access", "error");
      return;
    }
    toast(next === "ADMIN" ? `${name} is now an administrator` : `${name} is now a customer`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`label px-2 py-1 ${
          role === "ADMIN" ? "bg-ink text-bone" : "bg-bone-warm text-ink-mute"
        }`}
      >
        {role.toLowerCase()}
      </span>
      <button
        type="button"
        onClick={change}
        disabled={pending || isSelf}
        title={
          isSelf
            ? "You cannot change your own access"
            : next === "ADMIN"
              ? "Promote to administrator"
              : "Demote to customer"
        }
        className="label text-ink-mute underline-offset-4 transition-colors hover:text-ink hover:underline disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? <Spinner className="h-3 w-3" /> : next === "ADMIN" ? "promote" : "demote"}
      </button>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";

export function LogoutButton({ className = "btn-outline" }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className={className}
    >
      {pending ? (
        <Spinner />
      ) : (
        <>
          <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
          Sign out
        </>
      )}
    </button>
  );
}

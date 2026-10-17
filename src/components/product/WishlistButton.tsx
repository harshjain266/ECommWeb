"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

/**
 * Heart toggle. The wishlist lives on the account rather than in a cookie, so
 * an anonymous visitor is sent to sign in and returned to where they were.
 */
export function WishlistButton({
  productId,
  initiallySaved,
  variant = "icon",
  className,
}: {
  productId: string;
  initiallySaved: boolean;
  variant?: "icon" | "full";
  className?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [saved, setSaved] = useState(initiallySaved);
  const [pending, setPending] = useState(false);

  async function toggle(e: React.MouseEvent) {
    // The card wraps this in a link; don't navigate on a heart click.
    e.preventDefault();
    e.stopPropagation();
    setPending(true);

    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);

    if (res.status === 401) {
      toast("Sign in to save pieces", "error");
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!res.ok) {
      toast(data.error ?? "Could not update your wishlist", "error");
      return;
    }

    setSaved(data.saved);
    toast(data.saved ? "Saved to your wishlist" : "Removed from your wishlist");
    router.refresh();
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={saved}
        className={cn(
          "btn border transition-colors",
          saved
            ? "border-ink bg-ink text-bone"
            : "border-ink/25 text-ink hover:border-ink",
          className,
        )}
      >
        <Heart
          className="h-3.5 w-3.5"
          strokeWidth={1.5}
          fill={saved ? "currentColor" : "none"}
        />
        {saved ? "Saved" : "Add to wishlist"}
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={toggle}
      disabled={pending}
      whileTap={{ scale: 0.88 }}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-bone/90 text-ink backdrop-blur-sm transition-colors hover:bg-bone",
        className,
      )}
    >
      <Heart
        className={cn("h-[15px] w-[15px]", saved && "text-oxblood")}
        strokeWidth={1.5}
        fill={saved ? "currentColor" : "none"}
      />
    </motion.button>
  );
}

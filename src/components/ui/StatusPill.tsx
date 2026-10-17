import { cn } from "@/lib/utils";

/** Visual weight tracks how much attention a status deserves. */
const TONES: Record<string, string> = {
  PENDING: "bg-bone-deep text-ink-mute",
  PAID: "bg-ink text-bone",
  PROCESSING: "bg-gold-pale text-ink",
  SHIPPED: "bg-gold text-ink",
  DELIVERED: "bg-[#2F5D42] text-bone",
  CANCELLED: "bg-bone-warm text-ink-mute/70",
  REFUNDED: "bg-oxblood text-bone",
  // payment statuses
  CREATED: "bg-bone-deep text-ink-mute",
  AUTHORIZED: "bg-gold-pale text-ink",
  CAPTURED: "bg-[#2F5D42] text-bone",
  FAILED: "bg-oxblood text-bone",
};

export function StatusPill({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "label inline-block px-2.5 py-1.5",
        TONES[status] ?? "bg-bone-warm text-ink-mute",
        className,
      )}
    >
      {status.toLowerCase()}
    </span>
  );
}

import Link from "next/link";
import { Plus } from "lucide-react";

export function PageHead({
  title,
  blurb,
  action,
}: {
  title: string;
  blurb?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/10 pb-6">
      <div>
        <h1 className="display text-[clamp(1.9rem,4vw,2.6rem)] text-ink">{title}</h1>
        {blurb && (
          <p className="mt-2 max-w-2xl font-sans text-sm leading-relaxed text-ink-mute">
            {blurb}
          </p>
        )}
      </div>
      {action && (
        <Link href={action.href} className="btn-dark">
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
          {action.label}
        </Link>
      )}
    </div>
  );
}

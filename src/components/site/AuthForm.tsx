"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Spinner } from "@/components/ui/Spinner";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setFields({});

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      setFields(data.fields ?? {});
      setPending(false);
      return;
    }

    // `next` wins when present (it is how the admin gate bounces you back),
    // otherwise follow the role-based destination from the server.
    router.push(next || data.redirect || "/account");
    router.refresh();
  }

  const isLogin = mode === "login";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md"
    >
      <p className="label text-gold">{isLogin ? "Welcome back" : "Create an account"}</p>
      <h1 className="display mt-4 text-[clamp(2.2rem,6vw,3.2rem)] text-ink">
        {isLogin ? "Sign in" : "Join the house"}
      </h1>
      <p className="mt-3 font-sans text-sm leading-relaxed text-ink-mute">
        {isLogin
          ? "Your measurements, commissions and order history, kept in one place."
          : "So your measurements and fittings carry over from one commission to the next."}
      </p>

      <form onSubmit={onSubmit} className="mt-9 space-y-5" noValidate>
        {!isLogin && (
          <div>
            <label htmlFor="name" className="field-label">
              Full name
            </label>
            <input id="name" name="name" required autoComplete="name" className="field" />
            {fields.name && <span className="field-error">{fields.name}</span>}
          </div>
        )}

        <div>
          <label htmlFor="email" className="field-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="field"
          />
          {fields.email && <span className="field-error">{fields.email}</span>}
        </div>

        {!isLogin && (
          <div>
            <label htmlFor="phone" className="field-label">
              Phone <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" className="field" />
            {fields.phone && <span className="field-error">{fields.phone}</span>}
          </div>
        )}

        <div>
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete={isLogin ? "current-password" : "new-password"}
            minLength={isLogin ? undefined : 8}
            className="field"
          />
          {fields.password && <span className="field-error">{fields.password}</span>}
          {!isLogin && !fields.password && (
            <span className="mt-1.5 block font-sans text-xs text-ink-mute/70">
              At least 8 characters.
            </span>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="border-l-2 border-oxblood bg-oxblood/5 px-4 py-3 font-sans text-sm text-oxblood"
          >
            {error}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn-dark w-full">
          {pending ? <Spinner /> : isLogin ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-7 font-sans text-sm text-ink-mute">
        {isLogin ? "No account yet? " : "Already have an account? "}
        <Link
          href={
            isLogin
              ? `/register${next ? `?next=${encodeURIComponent(next)}` : ""}`
              : `/login${next ? `?next=${encodeURIComponent(next)}` : ""}`
          }
          className="link-sweep text-ink"
        >
          {isLogin ? "Create one" : "Sign in"}
        </Link>
      </p>
    </motion.div>
  );
}

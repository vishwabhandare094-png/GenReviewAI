"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import Logo from "@/components/Logo";
import TicketCard from "@/components/TicketCard";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(name: string, value: string) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.register(form);
      router.push("/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grain flex min-h-screen items-center justify-center bg-paper-dim px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <TicketCard>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-paprika">
            Owner sign up
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
            Set up your account
          </h1>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink-soft">Full name</span>
              <input
                required
                value={form.full_name}
                onChange={(e) => update("full_name", e.target.value)}
                className="w-full border border-line bg-paper px-3.5 py-2.5 text-ink outline-none focus:border-paprika"
                placeholder="Riya Sharma"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink-soft">Email</span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full border border-line bg-paper px-3.5 py-2.5 text-ink outline-none focus:border-paprika"
                placeholder="you@restaurant.com"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink-soft">Phone</span>
              <input
                required
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="w-full border border-line bg-paper px-3.5 py-2.5 text-ink outline-none focus:border-paprika"
                placeholder="+91 98765 43210"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink-soft">Password</span>
              <input
                required
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="w-full border border-line bg-paper px-3.5 py-2.5 text-ink outline-none focus:border-paprika"
                placeholder="••••••••"
              />
            </label>

            {error && <p className="text-sm text-plum-dark">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-paprika px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-paprika-dark disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-faint">
            Already onboard?{" "}
            <Link href="/login" className="text-paprika underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </TicketCard>
      </div>
    </div>
  );
}

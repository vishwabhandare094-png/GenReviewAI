"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import Logo from "@/components/Logo";
import TicketCard from "@/components/TicketCard";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ email, password });
      const body = res as {
        success?: boolean;
        message?: string;
        access_token?: string;
        token?: string;
        user?: { id?: string };
      };

      if (body.success === false) {
        throw new Error(body.message || "Invalid email or password");
      }

      const token = body.access_token || body.token || "session";
      localStorage.setItem("gr_token", token);

      if (body.user?.id) {
        localStorage.setItem("gr_owner_id", body.user.id);
      }

      router.push("/dashboard");
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
            Owner sign in
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
            Welcome back
          </h1>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink-soft">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-line bg-paper px-3.5 py-2.5 text-ink outline-none focus:border-paprika"
                placeholder="you@restaurant.com"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink-soft">Password</span>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-faint">
            New to GenReviewAI?{" "}
            <Link href="/register" className="text-paprika underline underline-offset-2">
              Create an account
            </Link>
          </p>
        </TicketCard>
      </div>
    </div>
  );
}
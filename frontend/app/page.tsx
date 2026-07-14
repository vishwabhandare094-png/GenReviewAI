import Link from "next/link";
import Logo from "@/components/Logo";
import TicketCard from "@/components/TicketCard";

export default function HomePage() {
  return (
    <div className="grain min-h-screen bg-paper-dim">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <Logo />
        <nav className="flex items-center gap-3 font-mono text-xs uppercase tracking-wide">
          <Link href="/login" className="text-ink-soft hover:text-ink">
            Sign in
          </Link>
          <Link
            href="/register"
            className="border border-ink px-4 py-2 text-ink hover:bg-ink hover:text-paper"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="mx-auto grid max-w-5xl items-center gap-12 px-6 py-16 sm:px-10 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-paprika">
            Scan · rate · post — in under 10 seconds
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.1] text-ink sm:text-5xl">
            Turn every table
            <br />
            into a review ticket.
          </h1>
          <p className="mt-5 max-w-md text-ink-soft">
            Customers scan a code, tap a star, tap a word or two, and get a short AI-assisted
            draft to post in their own words. Unhappy visits get routed to you privately, first —
            never blocked, never hidden.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="bg-paprika px-6 py-3 text-sm font-medium text-paper hover:bg-paprika-dark"
            >
              Set up your restaurant
            </Link>
            <Link
              href="/login"
              className="border border-ink px-6 py-3 text-sm font-medium text-ink hover:bg-ink hover:text-paper"
            >
              Owner sign in
            </Link>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-line pt-6">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                Time to post
              </dt>
              <dd className="mt-1 font-mono text-2xl text-ink">&lt;10s</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                Detractor capture
              </dt>
              <dd className="mt-1 font-mono text-2xl text-ink">~100%</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                Integrations needed
              </dt>
              <dd className="mt-1 font-mono text-2xl text-ink">0</dd>
            </div>
          </dl>
        </div>

        <div className="mx-auto w-full max-w-xs">
          <TicketCard>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-ink-faint">
              <span>Ticket #A1B2C3D4</span>
              <span>Preview</span>
            </div>
            <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-paprika">
              Thanks for visiting
            </p>
            <h2 className="mt-1 text-center font-display text-xl font-semibold text-ink">
              How was it?
            </h2>
            <div className="mt-6 flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg
                  key={s}
                  viewBox="0 0 24 24"
                  className={`h-8 w-8 ${s <= 4 ? "fill-amber stroke-amber-dark" : "fill-transparent stroke-ink-faint"}`}
                  strokeWidth={1.4}
                >
                  <path d="M12 2.5l2.9 6.32 6.85.72-5.12 4.7 1.42 6.86L12 17.9l-6.05 3.2 1.42-6.86-5.12-4.7 6.85-.72L12 2.5z" />
                </svg>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-ink-faint">
              No login. No app. One tap to start.
            </p>
          </TicketCard>
        </div>
      </main>
    </div>
  );
}

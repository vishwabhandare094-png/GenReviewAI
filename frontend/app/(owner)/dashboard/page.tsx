"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { DashboardResponse } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import MetricCard from "@/components/MetricCard";

function SentimentPill({ sentiment }: { sentiment?: string }) {
  const s = (sentiment || "").toLowerCase();
  const styles =
    s === "positive"
      ? "bg-sage/10 text-sage-dark border-sage/30"
      : s === "negative"
      ? "bg-plum/10 text-plum-dark border-plum/30"
      : "bg-amber/10 text-amber-dark border-amber/30";
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide ${styles}`}
    >
      {sentiment || "unrated"}
    </span>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restaurantId = localStorage.getItem("gr_restaurant_id");
    if (!restaurantId) {
      setError("No restaurant is linked to this account yet.");
      setLoading(false);
      return;
    }
    api
      .getDashboard(restaurantId)
      .then((res) => setData(res as DashboardResponse))
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Live feed"
        title="Dashboard"
        description="Every rating that comes through your QR code, sorted and summarized in real time."
      />

      <div className="px-8 py-8">
        {loading && (
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">
            Loading metrics…
          </p>
        )}

        {error && !loading && (
          <div className="border border-plum/30 bg-plum/5 px-5 py-4 text-sm text-plum-dark">
            {error}
          </div>
        )}

        {data && !loading && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <MetricCard label="Total reviews" value={data.metrics.total_reviews} />
              <MetricCard
                label="Average rating"
                value={data.metrics.average_rating.toFixed(1)}
                suffix="/ 5"
                tone="amber"
              />
              <MetricCard
                label="Positive"
                value={data.metrics.positive_reviews}
                tone="sage"
              />
              <MetricCard
                label="Negative"
                value={data.metrics.negative_reviews}
                tone="plum"
              />
              <MetricCard label="Neutral" value={data.metrics.neutral_reviews} />
            </div>

            <div className="mt-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                Recent tickets
              </p>
              <div className="mt-3 divide-y divide-line border border-line bg-paper">
                {data.recent_reviews.length === 0 && (
                  <p className="px-5 py-6 text-sm text-ink-faint">
                    No reviews yet — once your QR code gets scanned, they'll print here.
                  </p>
                )}
                {data.recent_reviews.map((r, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {r.customer_name || "Anonymous guest"}{" "}
                        <span className="font-mono text-xs text-ink-faint">
                          · {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                        </span>
                      </p>
                      {r.review_text && (
                        <p className="mt-1 max-w-lg text-sm text-ink-soft">
                          {r.review_text}
                        </p>
                      )}
                    </div>
                    <SentimentPill sentiment={r.sentiment} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

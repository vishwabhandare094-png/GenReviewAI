"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { api, ApiError } from "@/lib/api";
import type { DashboardResponse } from "@/lib/types";
import PageHeader from "@/components/PageHeader";

const COLORS = ["#5F7A52", "#8B3A56", "#D99A32"];

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [raw, setRaw] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restaurantId = localStorage.getItem("gr_restaurant_id");
    if (!restaurantId) {
      setError("No restaurant is linked to this account yet.");
      setLoading(false);
      return;
    }
    Promise.allSettled([
      api.getDashboard(restaurantId),
      api.getAnalytics(restaurantId),
    ])
      .then(([d, a]) => {
        if (d.status === "fulfilled") setDashboard(d.value as DashboardResponse);
        if (a.status === "fulfilled") setRaw(a.value as Record<string, unknown>);
        if (d.status === "rejected") setError((d.reason as ApiError).message);
      })
      .finally(() => setLoading(false));
  }, []);

  const pieData = dashboard
    ? [
        { name: "Positive", value: dashboard.metrics.positive_reviews },
        { name: "Negative", value: dashboard.metrics.negative_reviews },
        { name: "Neutral", value: dashboard.metrics.neutral_reviews },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div>
      <PageHeader
        eyebrow="Sentiment breakdown"
        title="Analytics"
        description="How your ratings split, and the recurring signals in what customers write."
      />

      <div className="px-8 py-8">
        {loading && (
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">
            Crunching numbers…
          </p>
        )}

        {error && !loading && (
          <div className="border border-plum/30 bg-plum/5 px-5 py-4 text-sm text-plum-dark">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="border border-line bg-paper p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                Sentiment split
              </p>
              {pieData.length === 0 ? (
                <p className="mt-10 text-sm text-ink-faint">
                  Not enough reviews yet to chart a split.
                </p>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#FBF3E7" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#241A14",
                          border: "none",
                          borderRadius: 4,
                          color: "#FBF3E7",
                          fontFamily: "var(--font-worksans)",
                          fontSize: 12,
                        }}
                      />
                      <Legend
                        formatter={(v) => (
                          <span className="font-mono text-xs text-ink-soft">{v}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="border border-line bg-paper p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                Additional signals
              </p>
              {raw && Object.keys(raw).length > 0 ? (
                <dl className="mt-4 space-y-3">
                  {Object.entries(raw).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between border-b border-line pb-2 text-sm"
                    >
                      <dt className="text-ink-soft">{key.replace(/_/g, " ")}</dt>
                      <dd className="font-mono tabular text-ink">
                        {typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-10 text-sm text-ink-faint">
                  No extended analytics reported by the backend for this restaurant yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

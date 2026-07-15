"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { api, ApiError } from "@/lib/api";
import type { DashboardResponse } from "@/lib/types";
import PageHeader from "@/components/PageHeader";

const COLORS = ["#5F7A52", "#8B3A56", "#D99A32"];

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [raw, setRaw] = useState<any | null>(null);
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
        if (a.status === "fulfilled") setRaw(a.value);
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

  const ratingDistribution = raw?.rating_distribution || {};
  const totalFromDist = Object.values(ratingDistribution).reduce((a: any, b: any) => a + b, 0) as number || 1;
  const starRatings = ["5", "4", "3", "2", "1"];

  const sentimentPct = raw?.sentiment_percentage || { positive: 0, negative: 0, neutral: 0 };
  const sentiments = [
    { name: "Positive", color: "#5F7A52", value: sentimentPct.positive },
    { name: "Neutral", color: "#D99A32", value: sentimentPct.neutral },
    { name: "Negative", color: "#8B3A56", value: sentimentPct.negative },
  ];

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
            {/* Sentiment split card */}
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

            {/* Ratings distribution card */}
            <div className="border border-line bg-paper p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                Rating Breakdown
              </p>
              <div className="mt-6 space-y-4">
                {starRatings.map((star) => {
                  const count = ratingDistribution[star] || 0;
                  const pct = Math.round((count / totalFromDist) * 100);
                  return (
                    <div key={star} className="flex items-center gap-3 text-sm">
                      <span className="w-8 font-mono text-ink-soft text-right">{star} ★</span>
                      <div className="h-2 flex-1 bg-paper-dim border border-line rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber transition-all duration-500" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-10 font-mono text-ink text-right">{count}</span>
                    </div>
                  );
                })}
              </div>

              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint mt-8">
                Sentiment Percentages
              </p>
              <div className="mt-4 space-y-3">
                {sentiments.map((s) => (
                  <div key={s.name} className="flex items-center gap-3 text-sm">
                    <span className="w-16 text-ink-soft font-medium">{s.name}</span>
                    <div className="h-2 flex-1 bg-paper-dim border border-line rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500" 
                        style={{ width: `${s.value}%`, backgroundColor: s.color }}
                      />
                    </div>
                    <span className="w-12 font-mono text-ink text-right">{s.value.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Volume Trend card */}
            {raw && raw.review_trend && raw.review_trend.length > 0 && (
              <div className="border border-line bg-paper p-6 col-span-1 lg:col-span-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                  Review Volume Trend
                </p>
                <div className="mt-6 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={raw.review_trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E6D3BC" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#241A14" 
                        tick={{ fontSize: 10, fontFamily: "var(--font-worksans)" }} 
                      />
                      <YAxis 
                        stroke="#241A14" 
                        tick={{ fontSize: 10, fontFamily: "var(--font-worksans)" }} 
                        allowDecimals={false}
                      />
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
                      <Line 
                        type="monotone" 
                        dataKey="reviews" 
                        stroke="#C05C3E" 
                        strokeWidth={2} 
                        dot={{ r: 4, stroke: "#C05C3E", strokeWidth: 1, fill: "#FBF3E7" }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
